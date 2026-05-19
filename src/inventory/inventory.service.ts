import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    name: string; category?: string; quantity?: number; minQuantity?: number;
    unit?: string; price?: number; supplier?: string; notes?: string;
  }) {
    return this.prisma.inventoryItem.create({ data: { ...data, condominiumId } });
  }

  async findAll(condominiumId: string, category?: string) {
    const where: any = { condominiumId };
    if (category) where.category = category;
    return this.prisma.inventoryItem.findMany({ where, orderBy: { name: 'asc' } });
  }

  async update(id: string, data: { quantity?: number; price?: number; supplier?: string; notes?: string }) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: { ...data, lastPurchaseAt: data.price ? new Date() : undefined },
    });
  }

  async delete(id: string) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async lowStock(condominiumId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { condominiumId, quantity: { lte: this.prisma.inventoryItem.fields.minQuantity } },
    });
  }
}
