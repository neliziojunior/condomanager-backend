import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    question: string;
    answer: string;
    keywords: string[];
    category?: string;
  }) {
    return this.prisma.faqEntry.create({
      data: {
        condominiumId,
        question: data.question,
        answer: data.answer,
        keywords: data.keywords,
        category: data.category || 'GENERAL',
      },
    });
  }

  async findAll(condominiumId: string) {
    return this.prisma.faqEntry.findMany({
      where: { condominiumId },
      orderBy: [{ priority: 'desc' }, { timesUsed: 'desc' }],
    });
  }

  async update(id: string, data: any) {
    return this.prisma.faqEntry.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.faqEntry.delete({ where: { id } });
  }

  // ✅ Buscar resposta por similaridade de palavras-chave
  async ask(condominiumId: string, question: string) {
    const faqs = await this.prisma.faqEntry.findMany({
      where: { condominiumId, isActive: true },
    });

    if (faqs.length === 0) {
      return {
        found: false,
        answer: 'Ainda não tenho uma resposta para essa pergunta. Entre em contato com o síndico.',
        suggestions: [],
      };
    }

    // Normalizar pergunta (minúsculas, remover acentos)
    const normalize = (text: string) =>
      text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2); // Ignorar palavras curtas

    const questionWords = normalize(question);

    let bestMatch: any = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;

      // Buscar nas keywords
      for (const keyword of faq.keywords) {
        const keywordWords = normalize(keyword);
        for (const kw of keywordWords) {
          if (questionWords.includes(kw)) score += 3;
          else if (questionWords.some(qw => qw.includes(kw) || kw.includes(qw))) score += 2;
        }
      }

      // Buscar na pergunta cadastrada
      const faqQuestionWords = normalize(faq.question);
      for (const fq of faqQuestionWords) {
        if (questionWords.includes(fq)) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    // Se encontrou uma resposta com boa pontuação
    if (bestMatch && bestScore >= 3) {
      // Incrementar contador de uso
      await this.prisma.faqEntry.update({
        where: { id: bestMatch.id },
        data: { timesUsed: { increment: 1 } },
      });

      return {
        found: true,
        answer: bestMatch.answer,
        question: bestMatch.question,
        confidence: Math.min(bestScore / 10, 1),
        suggestions: [],
      };
    }

    // Se não achou, retornar sugestões (perguntas mais populares)
    const suggestions = faqs
      .sort((a, b) => b.timesUsed - a.timesUsed)
      .slice(0, 5)
      .map(f => f.question);

    return {
      found: false,
      answer: 'Não encontrei uma resposta específica. Veja se uma destas perguntas ajuda:',
      suggestions,
    };
  }
}
