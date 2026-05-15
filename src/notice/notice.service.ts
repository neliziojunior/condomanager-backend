import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    expiresAt?: string;
  }) {
    return this.prisma.notice.create({
      data: {
        ...data,
        condominiumId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async findAll(condominiumId: string, filters?: { category?: string; activeOnly?: boolean }) {
    const where: any = { condominiumId };
    
    if (filters?.category) where.category = filters.category;
    if (filters?.activeOnly) where.isActive = true;

    return this.prisma.notice.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, data: { title?: string; content?: string; isActive?: boolean }) {
    return this.prisma.notice.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.notice.delete({ where: { id } });
  }
}
