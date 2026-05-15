import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OccurrenceService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, personId: string, data: { unitId?: string; title: string; description: string; type?: string }) {
    return this.prisma.occurrence.create({
      data: { ...data, condominiumId, personId },
      include: { unit: { select: { number: true } }, person: { select: { name: true } } },
    });
  }

  async findAll(condominiumId: string, filters?: { type?: string; status?: string }) {
    const where: any = { condominiumId };
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    return this.prisma.occurrence.findMany({
      where,
      include: { unit: { select: { number: true } }, person: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, response?: string) {
    return this.prisma.occurrence.update({
      where: { id },
      data: { status, ...(response && { response }) },
    });
  }
}
