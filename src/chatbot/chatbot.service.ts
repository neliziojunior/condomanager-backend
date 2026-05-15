import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
  }

  async chat(condominiumId: string, message: string, history: { role: string; content: string }[]) {
    const [condominium, units, spaces, notices] = await Promise.all([
      this.prisma.condominium.findUnique({ where: { id: condominiumId } }),
      this.prisma.unit.count({ where: { condominiumId } }),
      this.prisma.space.findMany({ where: { condominiumId, isActive: true }, select: { name: true, capacity: true, price: true } }),
      this.prisma.notice.findMany({ where: { condominiumId, isActive: true }, take: 3, orderBy: { createdAt: 'desc' }, select: { title: true, content: true } }),
    ]);

    const context = `Você é o assistente virtual do condomínio "${condominium?.name}".
      Total de unidades: ${units}.
      Espaços: ${spaces.map(s => `${s.name} (${s.capacity} pessoas${s.price ? `, R$${s.price}` : ''})`).join(', ') || 'Nenhum'}.
      Últimos avisos: ${notices.map(n => `"${n.title}": ${n.content}`).join(' | ') || 'Nenhum'}.
      Regras: proibido som alto após 22h, animais com coleira, reservas com 48h de antecedência.`;

    // Converter history para o formato correto
    const messages: any[] = [
      { role: 'system', content: context },
    ];

    for (const msg of history.slice(-10)) {
      if (msg.role === 'user') {
        messages.push({ role: 'user' as const, content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant' as const, content: msg.content });
      }
    }

    messages.push({ role: 'user' as const, content: message });

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      });

      return { reply: completion.choices[0].message.content };
    } catch (error) {
      console.error('Erro OpenAI:', error);
      return { reply: 'Desculpe, o assistente virtual está indisponível no momento. Entre em contato com a administração.' };
    }
  }
}
