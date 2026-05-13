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
    // Buscar o síndico logado para registrar como solicitante
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
    const where: any = {
      unit: { condominiumId }
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.unitId) where.unitId = filters.unitId;

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
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: status as any },
      include: {
        unit: { select: { number: true } },
        requester: { select: { name: true } },
      },
    });
  }

  async updatePriority(id: string, priority: string) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(priority)) {
      throw new BadRequestException('Prioridade inválida');
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { priority: priority as any },
      include: {
        unit: { select: { number: true } },
        requester: { select: { name: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
