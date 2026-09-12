import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CATEGORIES = [
  { name: 'Água', type: 'EXPENSE' as const, icon: 'water_drop', isDefault: true },
  { name: 'Luz', type: 'EXPENSE' as const, icon: 'bolt', isDefault: true },
  { name: 'Salários', type: 'EXPENSE' as const, icon: 'badge', isDefault: true },
  { name: 'Manutenção', type: 'EXPENSE' as const, icon: 'build', isDefault: true },
  { name: 'Fundo de Reserva', type: 'EXPENSE' as const, icon: 'savings', isDefault: true },
  { name: 'Funcionários', type: 'EXPENSE' as const, icon: 'badge', isDefault: true },
  { name: 'Taxa Condominial', type: 'INCOME' as const, icon: 'payments', isDefault: true },
  { name: 'Multas', type: 'INCOME' as const, icon: 'gavel', isDefault: true },
];

@Injectable()
export class CondominiumService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId: string) {
    const condominium = await this.prisma.condominium.create({
      data: {
        name: dto.name,
        cnpj: dto.cnpj,
        address: dto.address,
        monthlyFee: dto.monthlyFee,
        categories: {
          create: DEFAULT_CATEGORIES.map(cat => ({
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
    if (!user) return null;

    if (user.syndicOfId) {
      const condominium = await this.prisma.condominium.findUnique({
        where: { id: user.syndicOfId },
        include: { categories: true, units: true },
      });

      if (condominium) {
        return {
          ...condominium,
          paymentApiKey: condominium.paymentApiKey ? '••••••••••' : null,
        };
      }
    }

    // Auto-recuperação
    if (user.role === 'SYNDIC' || user.role === 'ADMIN') {
      const existingCondo = await this.prisma.condominium.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (existingCondo) {
        await this.prisma.person.update({
          where: { id: userId },
          data: { syndicOfId: existingCondo.id },
        });

        const condominium = await this.prisma.condominium.findUnique({
          where: { id: existingCondo.id },
          include: { categories: true, units: true },
        });

        if (condominium) {
          return {
            ...condominium,
            paymentApiKey: condominium.paymentApiKey ? '••••••••••' : null,
          };
        }
      }
    }

    return null;
  }

  async getById(id: string) {
    return this.prisma.condominium.findUnique({
      where: { id },
      include: { units: true, categories: true },
    });
  }

  async updatePaymentConfig(condominiumId: string, data: {
    provider: string;
    apiKey: string;
    walletId: string;
    enabled: boolean;
  }) {
    const condominium = await this.prisma.condominium.findUnique({
      where: { id: condominiumId },
    });
    
    if (!condominium) throw new NotFoundException('Condomínio não encontrado');

    const apiKey = data.apiKey?.includes('•') 
      ? condominium.paymentApiKey 
      : data.apiKey;

    return this.prisma.condominium.update({
      where: { id: condominiumId },
      data: {
        paymentProvider: data.provider,
        paymentApiKey: apiKey,
        paymentWalletId: data.walletId,
        paymentEnabled: data.enabled,
      },
    });
  }
}
