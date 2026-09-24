import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async create(dto: any, condominiumId: string) {
    if (!dto.categoryId) throw new BadRequestException('categoryId é obrigatório');

    const expense = await this.prisma.expense.create({
      data: {
        condominiumId,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        categoryId: dto.categoryId,
        unitId: dto.unitId,
        isRecurring: dto.isRecurring || false,
        recurringDay: dto.recurringDay || null,
        installment: dto.installment || null,
        totalInstallments: dto.totalInstallments || null,
        notes: dto.notes,
      },
      include: { category: true },
    });

    // ✅ Se parcelado, criar as parcelas automaticamente
    if (dto.totalInstallments && dto.totalInstallments > 1) {
      const baseDate = new Date(dto.dueDate);
      for (let i = 2; i <= dto.totalInstallments; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setMonth(futureDate.getMonth() + (i - 1));

        await this.prisma.expense.create({
          data: {
            condominiumId,
            description: `${dto.description} (${i}/${dto.totalInstallments})`,
            amount: dto.amount,
            dueDate: futureDate,
            categoryId: dto.categoryId,
            installment: i,
            totalInstallments: dto.totalInstallments,
          },
        });
      }
    }

    return expense;
  }

  async update(id: string, dto: any) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    return this.prisma.expense.update({
      where: { id },
      data: {
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        categoryId: dto.categoryId,
        notes: dto.notes,
      },
      include: { category: true },
    });
  }

  async delete(id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');
    return this.prisma.expense.delete({ where: { id } });
  }

  async getCondominium(id: string) {
    return this.prisma.condominium.findUnique({ where: { id } });
  }

  async getCategories(condominiumId: string) {
    return this.prisma.accountCategory.findMany({
      where: { condominiumId, type: 'EXPENSE' },
    });
  }

  async suggestCategory(dto: any, condominiumId: string) {
    const categories = await this.getCategories(condominiumId);
    if (categories.length === 0) throw new BadRequestException('Nenhuma categoria cadastrada.');
    const suggestion = await this.openaiService.suggestCategory(dto.description, categories);
    return { description: dto.description, suggestion, availableCategories: categories };
  }

  async findAll(condominiumId: string, filters?: { status?: string; categoryId?: string; startDate?: string; endDate?: string }) {
    const where: any = { condominiumId };
    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }

    return this.prisma.expense.findMany({
      where,
      include: { category: true, unit: true },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getSummary(condominiumId: string, month?: string) {
    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await this.prisma.expense.findMany({
      where: {
        condominiumId,
        dueDate: { gte: startDate, lt: endDate },
      },
    });

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const paid = expenses.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
    const overdue = expenses.filter(e => e.status === 'OVERDUE').reduce((s, e) => s + e.amount, 0);

    return { total, paid, pending, overdue, count: expenses.length };
  }

  async attachDocument(id: string, fileUrl: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');
    return this.prisma.expense.update({ where: { id }, data: { documentUrl: fileUrl } });
  }

  async markAsPaid(id: string, paymentDate: string, paidAmount?: number) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');
    return this.prisma.expense.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paidAt: new Date(),
        paidAmount: paidAmount || expense.amount,
      },
    });
  }
}
