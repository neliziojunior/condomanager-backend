import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenaiService } from '../openai/openai.service';
import { CreateExpenseDto, SuggestCategoryDto } from './dto';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async create(dto: CreateExpenseDto, condominiumId: string) {
    if (!dto.categoryId) {
      throw new BadRequestException('categoryId é obrigatório');
    }

    const expense = await this.prisma.expense.create({
      data: {
        condominiumId,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        categoryId: dto.categoryId,
        unitId: dto.unitId,
      },
    });

    return expense;
  }

  async suggestCategory(dto: SuggestCategoryDto, condominiumId: string) {
    const categories = await this.prisma.accountCategory.findMany({
      where: { condominiumId, type: 'EXPENSE' },
      select: { id: true, name: true },
    });

    if (categories.length === 0) {
      throw new BadRequestException(
        'Nenhuma categoria de despesa cadastrada.',
      );
    }

    const suggestion = await this.openaiService.suggestCategory(
      dto.description,
      categories,
    );

    return {
      description: dto.description,
      suggestion,
      availableCategories: categories,
    };
  }

  async findAll(condominiumId: string) {
    return this.prisma.expense.findMany({
      where: { condominiumId },
      include: { category: true, unit: true },
      orderBy: { dueDate: 'desc' },
    });
  }
}