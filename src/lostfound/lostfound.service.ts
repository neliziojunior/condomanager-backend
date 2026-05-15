import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LostFoundService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, personId: string, data: { title: string; description: string; type?: string; location?: string }) {
    return this.prisma.lostFound.create({ data: { ...data, condominiumId, personId } });
  }

  async findAll(condominiumId: string, type?: string) {
    const where: any = { condominiumId };
    if (type) where.type = type;
    return this.prisma.lostFound.findMany({
      where,
      include: { person: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markResolved(id: string) {
    return this.prisma.lostFound.update({ where: { id }, data: { status: 'RESOLVED' } });
  }
}
