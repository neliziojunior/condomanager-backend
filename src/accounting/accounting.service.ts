import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async importEntries(condominiumId: string, entries: { description: string; amount: number; date: string; type?: string }[]) {
    let count = 0;
    for (const entry of entries) {
      await this.prisma.accountingEntry.create({
        data: {
          condominiumId,
          description: entry.description,
          amount: entry.amount,
          date: new Date(entry.date),
          type: entry.type || 'EXPENSE',
          source: 'ACCOUNTANT',
        },
      });
      count++;
    }
    return { imported: count };
  }

  async syncSystemEntries(condominiumId: string) {
    const expenses = await this.prisma.expense.findMany({ where: { condominiumId } });
    for (const exp of expenses) {
      await this.prisma.accountingEntry.upsert({
        where: { id: `system-${exp.id}` },
        update: { description: exp.description, amount: exp.amount, date: exp.dueDate },
        create: {
          id: `system-${exp.id}`,
          condominiumId,
          description: exp.description,
          amount: exp.amount,
          date: exp.dueDate,
          type: 'EXPENSE',
          source: 'CONDONET',
          originalId: exp.id,
        },
      });
    }
    return { synced: expenses.length };
  }

  async compareEntries(condominiumId: string) {
    const systemEntries = await this.prisma.accountingEntry.findMany({
      where: { condominiumId, source: 'CONDONET' },
    });
    const accountantEntries = await this.prisma.accountingEntry.findMany({
      where: { condominiumId, source: 'ACCOUNTANT' },
    });

    const divergences: any[] = [];

    for (const sys of systemEntries) {
      const match = accountantEntries.find(
        a => a.description.toLowerCase().includes(sys.description.toLowerCase()) ||
             sys.description.toLowerCase().includes(a.description.toLowerCase())
      );

      if (match) {
        const diff = Math.abs(sys.amount - match.amount);
        if (diff > 0.01) {
          await this.prisma.accountingEntry.update({
            where: { id: sys.id },
            data: { reconciled: false, difference: diff, notes: `Divergência: Sistema R$${sys.amount} vs Contador R$${match.amount}` },
          });
          divergences.push({ system: sys, accountant: match, difference: diff });
        } else {
          await this.prisma.accountingEntry.update({ where: { id: sys.id }, data: { reconciled: true, difference: 0, notes: 'OK' } });
          await this.prisma.accountingEntry.update({ where: { id: match.id }, data: { reconciled: true, difference: 0, notes: 'OK' } });
        }
      } else {
        divergences.push({ system: sys, accountant: null, difference: sys.amount, notes: 'Não encontrado no contador' });
      }
    }

    return { totalSystem: systemEntries.length, totalAccountant: accountantEntries.length, divergences };
  }

  async findAll(condominiumId: string, source?: string) {
    const where: any = { condominiumId };
    if (source) where.source = source;
    return this.prisma.accountingEntry.findMany({ where, orderBy: { date: 'desc' } });
  }

  async getSummary(condominiumId: string) {
    const [systemTotal, accountantTotal, reconciled, total] = await Promise.all([
      this.prisma.accountingEntry.aggregate({ where: { condominiumId, source: 'CONDONET' }, _sum: { amount: true } }),
      this.prisma.accountingEntry.aggregate({ where: { condominiumId, source: 'ACCOUNTANT' }, _sum: { amount: true } }),
      this.prisma.accountingEntry.count({ where: { condominiumId, reconciled: true } }),
      this.prisma.accountingEntry.count({ where: { condominiumId } }),
    ]);
    return {
      systemTotal: systemTotal._sum.amount || 0,
      accountantTotal: accountantTotal._sum.amount || 0,
      reconciled,
      total,
      difference: (systemTotal._sum.amount || 0) - (accountantTotal._sum.amount || 0),
    };
  }

  // ✅ NOVO: Relatório Anual
  async getRelatorioAnual(condominiumId: string) {
    const ano = new Date().getFullYear();
    const expenses = await this.prisma.expense.findMany({
      where: { condominiumId, createdAt: { gte: new Date(`${ano}-01-01`) } },
      include: { category: true },
    });

    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const balancete = meses.map(mes => {
      const despesasMes = expenses.filter(e => {
        const d = new Date(e.createdAt);
        return d.getMonth() + 1 === mes;
      });
      return {
        mes,
        total: despesasMes.reduce((sum, e) => sum + e.amount, 0),
        categorias: despesasMes.reduce((acc: any, e) => {
          const cat = e.category?.name || 'Outros';
          acc[cat] = (acc[cat] || 0) + e.amount;
          return acc;
        }, {}),
      };
    });

    return {
      ano,
      balancete,
      totalAno: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }
}
