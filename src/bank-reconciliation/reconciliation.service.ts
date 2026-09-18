
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class ReconciliationService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
  }

  // 📤 Processar extrato (upload)
  async processStatement(condominiumId: string, fileUrl: string, fileName: string, fileType: string) {
    // 1. Criar registro inicial
    const statement = await this.prisma.bankStatement.create({
      data: {
        condominiumId,
        fileUrl,
        fileName,
        fileType,
        status: 'PROCESSING',
      },
    });

    try {
      // 2. Extrair lançamentos via IA
      const entries = await this.extractEntriesWithAI(fileUrl, fileType);

      // 3. Salvar lançamentos
      for (const entry of entries.entries) {
        await this.prisma.statementEntry.create({
          data: {
            statementId: statement.id,
            date: new Date(entry.date),
            amount: entry.amount,
            description: entry.description,
            type: entry.type,
          },
        });
      }

      // 4. Atualizar status
      await this.prisma.bankStatement.update({
        where: { id: statement.id },
        data: {
          status: 'REVIEW',
          bankName: entries.bank,
          periodStart: entries.periodStart ? new Date(entries.periodStart) : null,
          periodEnd: entries.periodEnd ? new Date(entries.periodEnd) : null,
          totalEntries: entries.entries.length,
          processedAt: new Date(),
        },
      });

      // 5. Classificar automaticamente
      await this.classifyEntries(statement.id, condominiumId);

      return this.findById(statement.id);
    } catch (error) {
      await this.prisma.bankStatement.update({
        where: { id: statement.id },
        data: { status: 'ERROR' },
      });
      throw new BadRequestException(`Erro ao processar extrato: ${error.message}`);
    }
  }

  // 🤖 IA extrai lançamentos
  private async extractEntriesWithAI(fileUrl: string, fileType: string) {
    const prompt = `Você é um assistente contábil especializado em extratos bancários brasileiros.

Analise o extrato e extraia TODOS os lançamentos.

Retorne APENAS um JSON válido neste formato:
{
  "bank": "Nome do banco",
  "periodStart": "YYYY-MM-DD",
  "periodEnd": "YYYY-MM-DD",
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "amount": 350.00,
      "description": "Descrição do lançamento",
      "type": "CREDIT" ou "DEBIT"
    }
  ]
}

REGRAS:
- CREDIT = entrada de dinheiro (depósitos, PIX recebido, transferências recebidas)
- DEBIT = saída de dinheiro (pagamentos, saques, tarifas)
- amount sempre positivo (o type define se entra ou sai)
- Se não conseguir identificar o banco, deixe "bank": null
- Se o extrato estiver em imagem, use OCR para ler os valores

Não inclua nenhum texto além do JSON.`;

    try {
      // Se for imagem, enviar como image_url
      const isImage = fileType.startsWith('image/') || fileUrl.match(/\.(jpg|jpeg|png)$/i);
      
      const messages: any[] = [
        {
          role: 'user',
          content: isImage
            ? [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: fileUrl } },
              ]
            : prompt,
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.1,
        max_tokens: 4000,
      });

      const content = completion.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error('IA não retornou JSON válido');
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Erro IA:', error);
      throw new Error('Falha ao extrair lançamentos');
    }
  }

  // 🏷️ Classificar lançamentos automaticamente
  private async classifyEntries(statementId: string, condominiumId: string) {
    const entries = await this.prisma.statementEntry.findMany({
      where: { statementId, aiCategory: null },
    });

    const categories = await this.prisma.accountCategory.findMany({
      where: { condominiumId },
      select: { id: true, name: true, type: true },
    });

    // Buscar histórico dos últimos 3 meses
    const history = await this.prisma.statementEntry.findMany({
      where: {
        statement: { condominiumId },
        aiCategory: { not: null },
        approved: true,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: { description: true, aiCategory: true, type: true },
    });

    for (const entry of entries) {
      try {
        const classification = await this.classifyEntry(entry, categories, history);
        
        if (classification) {
          const category = categories.find(c => c.name === classification.category);
          
          await this.prisma.statementEntry.update({
            where: { id: entry.id },
            data: {
              aiCategory: classification.category,
              aiConfidence: classification.confidence,
              aiMatched: classification.matched || false,
              categoryId: category?.id,
            },
          });
        }
      } catch (error) {
        console.error('Erro ao classificar:', entry.id, error.message);
      }
    }
  }

  // 🧠 IA classifica um lançamento
  private async classifyEntry(entry: any, categories: any[], history: any[]) {
    const categoriesList = categories.map(c => `- ${c.name} (${c.type})`).join('\n');
    
    const historySample = history.slice(0, 30).map(h => 
      `"${h.description}" → ${h.aiCategory}`
    ).join('\n');

    const prompt = `Você é um classificador contábil.

LANÇAMENTO ATUAL:
- Data: ${new Date(entry.date).toLocaleDateString('pt-BR')}
- Valor: R$ ${entry.amount.toFixed(2)}
- Tipo: ${entry.type === 'CREDIT' ? 'ENTRADA' : 'SAÍDA'}
- Descrição: "${entry.description}"

CATEGORIAS DISPONÍVEIS:
${categoriesList}

HISTÓRICO DE CLASSIFICAÇÕES ANTERIORES:
${historySample || 'Sem histórico ainda'}

INSTRUÇÕES:
1. Se encontrar descrição similar no histórico, use a mesma categoria (matched: true)
2. Caso contrário, escolha a categoria mais adequada
3. Confiança de 0.0 a 1.0

Responda APENAS com JSON:
{ "category": "Nome da categoria", "confidence": 0.95, "matched": true }`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 150,
      });

      const content = completion.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) return null;
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return null;
    }
  }

  async findAll(condominiumId: string) {
    return this.prisma.bankStatement.findMany({
      where: { condominiumId },
      include: {
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.bankStatement.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            category: { select: { id: true, name: true, type: true } },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async updateEntry(entryId: string, data: { categoryId?: string; approved?: boolean; notes?: string }) {
    return this.prisma.statementEntry.update({
      where: { id: entryId },
      data,
    });
  }

  async approveAll(statementId: string) {
    await this.prisma.statementEntry.updateMany({
      where: { statementId },
      data: { approved: true },
    });

    return this.prisma.bankStatement.update({
      where: { id: statementId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
  }

  async delete(id: string) {
    return this.prisma.bankStatement.delete({ where: { id } });
  }
}

