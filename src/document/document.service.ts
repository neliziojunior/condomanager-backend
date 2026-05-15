import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, title: string, category: string, fileUrl: string, fileSize?: number) {
    return this.prisma.document.create({
      data: { condominiumId, title, category, fileUrl, fileSize },
    });
  }

  async findAll(condominiumId: string, category?: string) {
    const where: any = { condominiumId };
    if (category) where.category = category;
    return this.prisma.document.findMany({ where, orderBy: { uploadedAt: 'desc' } });
  }

  async delete(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
