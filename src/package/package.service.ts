import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackageService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    unitId: string;
    description: string;
    carrier?: string;
    trackingCode?: string;
    notes?: string;
  }) {
    return this.prisma.package.create({
      data: {
        ...data,
        condominiumId,
      },
      include: {
        unit: { select: { number: true } },
      },
    });
  }

  async findAll(condominiumId: string, status?: string) {
    const where: any = { condominiumId };
    if (status) where.status = status;

    return this.prisma.package.findMany({
      where,
      include: {
        unit: { select: { number: true } },
      },
      orderBy: [{ status: 'asc' }, { arrivedAt: 'desc' }],
    });
  }

  async markRetrieved(id: string, retrievedBy: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Encomenda não encontrada');

    return this.prisma.package.update({
      where: { id },
      data: {
        status: 'RETRIEVED',
        retrievedAt: new Date(),
        retrievedBy,
      },
    });
  }

  async getPendingCount(condominiumId: string) {
    return this.prisma.package.count({
      where: { condominiumId, status: 'PENDING' },
    });
  }
}
