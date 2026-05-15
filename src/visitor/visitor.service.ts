import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    unitId: string; name: string; document?: string; reason?: string; authorizedBy: string;
  }) {
    return this.prisma.visitor.create({
      data: { ...data, condominiumId },
      include: { unit: { select: { number: true } } },
    });
  }

  async findAll(condominiumId: string, status?: string) {
    const where: any = { condominiumId };
    if (status) where.status = status;
    return this.prisma.visitor.findMany({
      where,
      include: { unit: { select: { number: true } } },
      orderBy: { entryAt: 'desc' },
    });
  }

  async registerExit(id: string) {
    return this.prisma.visitor.update({
      where: { id },
      data: { exitAt: new Date(), status: 'INACTIVE' },
    });
  }

  async activeCount(condominiumId: string) {
    return this.prisma.visitor.count({ where: { condominiumId, status: 'ACTIVE' } });
  }
}
