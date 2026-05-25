import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class CondoAIService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
  }

  async getPredictions(condominiumId: string) {
    // Buscar histórico dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await this.prisma.expense.findMany({
      where: { condominiumId, createdAt: { gte: sixMonthsAgo } },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por categoria
    const byCategory: any = {};
    for (const exp of expenses) {
      const cat = exp.category?.name || 'Outros';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({
        month: exp.createdAt.toISOString().slice(0, 7),
        amount: exp.amount,
        description: exp.description,
      });
    }

    // Preparar dados para IA
    const summary = Object.entries(byCategory).map(([cat, data]: any) => {
      const total = data.reduce((sum: number, d: any) => sum + d.amount, 0);
      const avg = total / data.length;
      const lastMonth = data.filter((d: any) => d.month === new Date().toISOString().slice(0, 7));
      const lastAmount = lastMonth.reduce((sum: number, d: any) => sum + d.amount, 0);
      return { category: cat, total, avg, months: data.length, lastMonth: lastAmount };
    });

    // Chamar IA para análise
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista financeiro de condomínios. Analise os dados e retorne previsões e recomendações em JSON no formato: {"predictions":[{"category":"...","nextMonth":0,"trend":"up/down/stable","alert":"...","recommendation":"..."}],"summary":"...","riskLevel":"low/medium/high"}',
          },
          {
            role: 'user',
            content: `Analise estes gastos dos últimos meses e preveja o próximo mês: ${JSON.stringify(summary)}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const content = completion.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const predictions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      return {
        historical: summary,
        predictions: predictions?.predictions || [],
        summary: predictions?.summary || 'Análise não disponível',
        riskLevel: predictions?.riskLevel || 'low',
        totalPredicted: predictions?.predictions?.reduce((sum: number, p: any) => sum + (p.nextMonth || 0), 0) || 0,
      };
    } catch (error) {
      // Fallback sem IA
      return {
        historical: summary,
        predictions: summary.map((s: any) => ({
          category: s.category,
          nextMonth: s.avg,
          trend: s.lastMonth > s.avg ? 'up' : 'down',
          alert: s.lastMonth > s.avg * 1.2 ? '⚠️ Acima da média' : '✅ Normal',
          recommendation: 'Continue monitorando',
        })),
        summary: 'Previsão baseada em média histórica',
        riskLevel: 'low',
        totalPredicted: summary.reduce((sum: number, s: any) => sum + s.avg, 0),
      };
    }
  }
}
