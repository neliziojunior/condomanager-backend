import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CondoScoreService {
  constructor(private prisma: PrismaService) {}

  async calculateScore(condominiumId: string) {
    // 1. Financeiro (40 pts) - Baseado em despesas pagas
    const totalExpenses = await this.prisma.expense.count({ where: { condominiumId } });
    const paidExpenses = await this.prisma.expense.count({ where: { condominiumId, status: 'PAID' } });
    const financeScore = totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 40) : 40;

    // 2. Manutenção (25 pts) - Baseado em chamados resolvidos
    const totalMaintenance = await this.prisma.maintenanceRequest.count({ where: { unit: { condominiumId } } });
    const resolvedMaintenance = await this.prisma.maintenanceRequest.count({ where: { unit: { condominiumId }, status: 'COMPLETED' } });
    const maintenanceScore = totalMaintenance > 0 ? Math.round((resolvedMaintenance / totalMaintenance) * 25) : 25;

    // 3. Documentos (20 pts) - Baseado em documentos cadastrados
    const totalDocs = await this.prisma.document.count({ where: { condominiumId } });
    const docScore = Math.min(20, totalDocs * 5);

    // 4. Social (15 pts) - Baseado em unidades cadastradas
    const totalUnits = await this.prisma.unit.count({ where: { condominiumId } });
    const socialScore = totalUnits > 0 ? 15 : 5;

    const totalScore = financeScore + maintenanceScore + docScore + socialScore;

    let category, color, emoji;
    const recommendations = [];

    if (totalScore >= 80) {
      category = 'Excelente';
      color = '#02C39A';
      emoji = '🟢';
      recommendations.push('🏆 CondoPro Excellence! Seu condomínio é referência em gestão.');
    } else if (totalScore >= 60) {
      category = 'Bom';
      color = '#00A896';
      emoji = '🔵';
      recommendations.push('Continue assim! Mantenha as despesas em dia.');
    } else if (totalScore >= 40) {
      category = 'Regular';
      color = '#F0A500';
      emoji = '🟡';
      recommendations.push('Atenção: Quite as despesas pendentes para melhorar a pontuação.');
    } else {
      category = 'Crítico';
      color = '#E63946';
      emoji = '🔴';
      recommendations.push('⚠️ Urgente: Regularize as finanças e manutenções.');
    }

    return {
      score: totalScore,
      maxScore: 100,
      category,
      color,
      emoji,
      details: {
        financeiro: financeScore,
        manutencao: maintenanceScore,
        documentos: docScore,
        social: socialScore,
      },
      recommendations,
    };
  }
}
