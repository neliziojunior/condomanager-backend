import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, personId: string, data: {
    title: string; description: string; price?: number; type?: string;
  }) {
    return this.prisma.listing.create({
      data: { ...data, condominiumId, personId },
      include: { person: { select: { name: true } } },
    });
  }

  async findAll(condominiumId: string, type?: string) {
    const where: any = { condominiumId, status: 'ACTIVE' };
    if (type) where.type = type;
    return this.prisma.listing.findMany({
      where,
      include: { person: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivate(id: string) {
    return this.prisma.listing.update({ where: { id }, data: { status: 'INACTIVE' } });
  }
}
