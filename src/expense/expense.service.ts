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

    return this.prisma.expense.create({
      data: {
        condominiumId,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        categoryId: dto.categoryId,
        unitId: dto.unitId,
      },
      include: { category: true },
    });
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
      },
      include: { category: true },
    });
  }

  async delete(id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    return this.prisma.expense.delete({ where: { id } });
  }

  async suggestCategory(dto: any, condominiumId: string) {
    const categories = await this.prisma.accountCategory.findMany({
      where: { condominiumId, type: 'EXPENSE' },
      select: { id: true, name: true },
    });

    if (categories.length === 0) throw new BadRequestException('Nenhuma categoria cadastrada.');

    const suggestion = await this.openaiService.suggestCategory(dto.description, categories);

    return { description: dto.description, suggestion, availableCategories: categories };
  }

  async findAll(condominiumId: string) {
    return this.prisma.expense.findMany({
      where: { condominiumId },
      include: { category: true, unit: true },
      orderBy: { dueDate: 'desc' },
    });
  }

  async attachDocument(id: string, fileUrl: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    return this.prisma.expense.update({
      where: { id },
      data: { documentUrl: fileUrl },
    });
  }

  async markAsPaid(id: string, paymentDate: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    return this.prisma.expense.update({
      where: { id },
      data: { status: 'PAID', paymentDate: paymentDate ? new Date(paymentDate) : new Date() },
    });
  }
}
