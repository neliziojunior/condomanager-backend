import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, createdById: string, data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    pinnedUntil?: string;
    expiresAt?: string;
  }) {
    return this.prisma.notice.create({
      data: {
        condominiumId,
        createdById,
        title: data.title,
        content: data.content,
        category: data.category || 'GENERAL',
        priority: data.priority || 'NORMAL',
        pinnedUntil: data.pinnedUntil ? new Date(data.pinnedUntil) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async findAll(condominiumId: string, filters?: { category?: string; activeOnly?: boolean }) {
    const where: any = { condominiumId };
    if (filters?.category) where.category = filters.category;
    if (filters?.activeOnly) where.isActive = true;

    const notices = await this.prisma.notice.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Ordenar: fixados primeiro, depois por prioridade
    return notices.sort((a, b) => {
      const aPinned = a.pinnedUntil && new Date(a.pinnedUntil) > new Date();
      const bPinned = b.pinnedUntil && new Date(b.pinnedUntil) > new Date();
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }

  async update(id: string, data: any) {
    return this.prisma.notice.update({ where: { id }, data });
  }

  async incrementViews(id: string) {
    return this.prisma.notice.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async delete(id: string) {
    return this.prisma.notice.delete({ where: { id } });
  }
}
