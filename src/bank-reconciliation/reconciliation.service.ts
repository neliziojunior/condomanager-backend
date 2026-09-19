import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ReconciliationService {
  private openai: OpenAI;
  private hasAI: boolean;

  constructor(private prisma: PrismaService) {
    const key = process.env.OPENAI_API_KEY || '';
    this.hasAI = !!key && !key.includes('placeholder') && key.startsWith('sk-');
    this.openai = new OpenAI({ apiKey: key || 'sk-placeholder' });
  }

  async processStatement(condominiumId: string, fileUrl: string, fileName: string, fileType: string) {
    const statement = await this.prisma.bankStatement.create({
      data: { condominiumId, fileUrl, fileName, fileType, status: 'PROCESSING' },
    });

    try {
      if (this.hasAI) {
        const entries = await this.extractEntriesWithAI(fileUrl, fileType);

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

        await this.classifyEntries(statement.id, condominiumId);
      } else {
        await this.prisma.bankStatement.update({
          where: { id: statement.id },
          data: { status: 'REVIEW', bankName: 'Manual', processedAt: new Date() },
        });
      }

      return this.findById(statement.id);
    } catch (error) {
      await this.prisma.bankStatement.update({
        where: { id: statement.id },
        data: { status: 'REVIEW', bankName: 'Manual', processedAt: new Date() },
      });
      return this.findById(statement.id);
    }
  }

  async addManualEntry(statementId: string, data: {
    date: string; amount: number; description: string; type: string; categoryId?: string;
  }) {
    const entry = await this.prisma.statementEntry.create({
      data: {
        statementId,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        approved: true,
      },
    });

    const count = await this.prisma.statementEntry.count({ where: { statementId } });
    await this.prisma.bankStatement.update({
      where: { id: statementId },
      data: { totalEntries: count },
    });

    return entry;
  }

  private async extractEntriesWithAI(fileUrl: string, fileType: string) {
    const prompt = `Você é um assistente contábil. Analise o extrato e extraia TODOS os lançamentos.

Retorne APENAS JSON:
{ "bank": "Nome", "periodStart": "YYYY-MM-DD", "periodEnd": "YYYY-MM-DD",
  "entries": [{ "date": "YYYY-MM-DD", "amount": 350.00, "description": "...", "type": "CREDIT" ou "DEBIT" }] }

CREDIT = entrada / DEBIT = saída. amount sempre positivo.`;

    const isImage = fileType.startsWith('image/') || fileUrl.match(/\.(jpg|jpeg|png)$/i);

    const messages: any[] = [{
      role: 'user',
      content: isImage
        ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: fileUrl } }]
        : prompt,
    }];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = completion.choices[0].message.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('IA não retornou JSON');
    return JSON.parse(jsonMatch[0]);
  }

  private async classifyEntries(statementId: string, condominiumId: string) {
    const entries = await this.prisma.statementEntry.findMany({
      where: { statementId, aiCategory: null },
    });

    const categories = await this.prisma.accountCategory.findMany({
      where: { condominiumId },
      select: { id: true, name: true, type: true },
    });

    const history = await this.prisma.statementEntry.findMany({
      where: { statement: { condominiumId }, aiCategory: { not: null }, approved: true },
      take: 100, orderBy: { createdAt: 'desc' },
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
      } catch (error) {}
    }
  }

  private async classifyEntry(entry: any, categories: any[], history: any[]) {
    const categoriesList = categories.map(c => `- ${c.name}`).join('\n');
    const historySample = history.slice(0, 30).map(h => `"${h.description}" → ${h.aiCategory}`).join('\n');

    const prompt = `Classificador contábil.

LANÇAMENTO: ${new Date(entry.date).toLocaleDateString('pt-BR')} | R$ ${entry.amount.toFixed(2)} | ${entry.type} | "${entry.description}"

CATEGORIAS:
${categoriesList}

HISTÓRICO:
${historySample || 'Sem histórico'}

Responda APENAS JSON: { "category": "...", "confidence": 0.95, "matched": true }`;

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
  }

  async findAll(condominiumId: string) {
    return this.prisma.bankStatement.findMany({
      where: { condominiumId },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.bankStatement.findUnique({
      where: { id },
      include: {
        entries: {
          include: { category: { select: { id: true, name: true, type: true } } },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async updateEntry(entryId: string, data: any) {
    return this.prisma.statementEntry.update({ where: { id: entryId }, data });
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
