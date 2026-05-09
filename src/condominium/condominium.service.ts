import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CATEGORIES = [
  { name: 'Água', type: 'EXPENSE' as const, icon: 'water_drop', isDefault: true },
  { name: 'Luz', type: 'EXPENSE' as const, icon: 'bolt', isDefault: true },
  { name: 'Salários', type: 'EXPENSE' as const, icon: 'badge', isDefault: true },
  { name: 'Manutenção', type: 'EXPENSE' as const, icon: 'build', isDefault: true },
  { name: 'Fundo de Reserva', type: 'EXPENSE' as const, icon: 'savings', isDefault: true },
  { name: 'Taxa Condominial', type: 'INCOME' as const, icon: 'payments', isDefault: true },
  { name: 'Multas', type: 'INCOME' as const, icon: 'gavel', isDefault: true },
];

@Injectable()
export class CondominiumService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { name: string; address: string; cnpj?: string; monthlyFee?: number }, userId: string) {
    const condominium = await this.prisma.condominium.create({
      data: {
        name: dto.name,
        address: dto.address,
        cnpj: dto.cnpj,
        monthlyFee: dto.monthlyFee,
        categories: {
          create: DEFAULT_CATEGORIES.map((cat) => ({
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            isDefault: cat.isDefault,
          })),
        },
      },
    });

    await this.prisma.person.update({
      where: { id: userId },
      data: { syndicOfId: condominium.id },
    });

    return condominium;
  }

  async findByUser(userId: string) {
    const user = await this.prisma.person.findUnique({ where: { id: userId } });
    if (!user?.syndicOfId) return null;

    return this.prisma.condominium.findUnique({
      where: { id: user.syndicOfId },
      include: { categories: true, units: true },
    });
  }

  async getById(id: string) {
    return this.prisma.condominium.findUnique({
      where: { id },
      include: { units: true, categories: true },
    });
  }
}
