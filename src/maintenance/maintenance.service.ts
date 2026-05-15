import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    unitId: string;
    title: string;
    description: string;
    priority?: string;
    photos?: string[];
  }) {
    const syndic = await this.prisma.person.findFirst({
      where: { syndicOfId: condominiumId, role: 'SYNDIC' }
    });

    return this.prisma.maintenanceRequest.create({
      data: {
        unit: { connect: { id: data.unitId } },
        requester: { connect: { id: syndic?.id || '' } },
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || 'MEDIUM',
        photos: data.photos || [],
      },
      include: {
        unit: { select: { number: true } },
        requester: { select: { name: true } },
      },
    });
  }

  async findAll(condominiumId: string, filters?: { status?: string; priority?: string; unitId?: string }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.unitId) where.unitId = filters.unitId;

    const units = await this.prisma.unit.findMany({
      where: { condominiumId },
      select: { id: true }
    });
    
    where.unitId = { in: units.map(u => u.id) };

    return this.prisma.maintenanceRequest.findMany({
      where,
      include: {
        unit: { select: { number: true } },
        requester: { select: { name: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updatePriority(id: string, priority: string) {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { priority: priority as any },
    });
  }

  async delete(id: string) {
    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
