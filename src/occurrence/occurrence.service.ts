import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OccurrenceService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, personId: string, data: {
    unitId?: string;
    title: string;
    description: string;
    type?: string;
    priority?: string;
    photos?: string[];
  }) {
    return this.prisma.occurrence.create({
      data: {
        condominiumId,
        personId,
        unitId: data.unitId || null,
        title: data.title,
        description: data.description,
        type: data.type || 'COMPLAINT',
        priority: data.priority || 'MEDIUM',
        photos: data.photos || [],
      },
      include: {
        unit: { select: { number: true } },
        person: { select: { name: true } },
      },
    });
  }

  async findAll(condominiumId: string, filters?: { type?: string; status?: string; priority?: string }) {
    const where: any = { condominiumId };
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    return this.prisma.occurrence.findMany({
      where,
      include: {
        unit: { select: { number: true } },
        person: { select: { name: true } },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateStatus(id: string, status: string, response?: string, respondedBy?: string) {
    return this.prisma.occurrence.update({
      where: { id },
      data: {
        status,
        ...(response && { response }),
        ...(respondedBy && { respondedBy }),
        ...(response && { respondedAt: new Date() }),
      },
      include: {
        unit: { select: { number: true } },
        person: { select: { name: true } },
      },
    });
  }

  async updatePriority(id: string, priority: string) {
    return this.prisma.occurrence.update({
      where: { id },
      data: { priority },
    });
  }

  async delete(id: string) {
    return this.prisma.occurrence.delete({ where: { id } });
  }
}
