import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CondoScoreService {
  constructor(private prisma: PrismaService) {}

  async calculateScore(condominiumId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Saúde Financeira (40 pontos)
    const totalExpenses = await this.prisma.expense.aggregate({
      where: { condominiumId, createdAt: { gte: monthStart } },
      _sum: { amount: true },
    });

    const paidExpenses = await this.prisma.expense.count({
      where: { condominiumId, status: 'PAID', createdAt: { gte: monthStart } },
    });

    const totalExpenseCount = await this.prisma.expense.count({
      where: { condominiumId, createdAt: { gte: monthStart } },
    });

    const paymentRate = totalExpenseCount > 0 ? (paidExpenses / totalExpenseCount) * 40 : 40;

    // 2. Manutenção (25 pontos)
    const totalMaintenance = await this.prisma.maintenanceRequest.count({
      where: { unit: { condominiumId } },
    });

    const resolvedMaintenance = await this.prisma.maintenanceRequest.count({
      where: { unit: { condominiumId }, status: 'COMPLETED' },
    });

    const maintenanceRate = totalMaintenance > 0 ? (resolvedMaintenance / totalMaintenance) * 25 : 25;

    // 3. Participação Social (20 pontos)
    const totalUnits = await this.prisma.unit.count({ where: { condominiumId } });
    
    const recentAssembly = await this.prisma.assembly.findFirst({
      where: { condominiumId },
      orderBy: { date: 'desc' },
      include: { confirmations: true },
    });

    let participationRate = 20;
    if (recentAssembly && totalUnits > 0) {
      const present = recentAssembly.confirmations.filter(c => c.status === 'PRESENT').length;
      participationRate = Math.min(20, (present / totalUnits) * 20);
    }

    // 4. Compliance (15 pontos)
    const totalDocs = await this.prisma.document.count({ where: { condominiumId } });
    const docsRate = Math.min(15, totalDocs * 3);

    const totalScore = Math.round(paymentRate + maintenanceRate + participationRate + docsRate);

    // Categoria
    let category = 'Regular';
    let color = '#F0A500';
    let emoji = '🟡';
    let recommendations: string[] = [];

    if (totalScore >= 85) {
      category = 'Excelente';
      color = '#02C39A';
      emoji = '🟢';
      recommendations = ['🏆 CondoPro Excellence! Seu condomínio é referência em gestão.'];
    } else if (totalScore >= 70) {
      category = 'Bom';
      color = '#00A896';
      emoji = '🔵';
      recommendations = ['Continue assim! Foque em aumentar a participação em assembleias.'];
    } else if (totalScore >= 50) {
      category = 'Regular';
      color = '#F0A500';
      emoji = '🟡';
      recommendations = [
        'Atenção: Aumente a taxa de pagamento de despesas.',
        'Considere fazer manutenções preventivas para reduzir chamados.',
      ];
    } else {
      category = 'Crítico';
      color = '#E63946';
      emoji = '🔴';
      recommendations = [
        '⚠️ Urgente: Alta inadimplência detectada.',
        '⚠️ Muitos chamados de manutenção em aberto.',
        'Agende uma assembleia para discutir finanças.',
      ];
    }

    return {
      score: totalScore,
      category,
      color,
      emoji,
      details: {
        financeiro: Math.round(paymentRate),
        manutencao: Math.round(maintenanceRate),
        social: Math.round(participationRate),
        compliance: Math.round(docsRate),
      },
      recommendations,
      maxScore: 100,
    };
  }
}
