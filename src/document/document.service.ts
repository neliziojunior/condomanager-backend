import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, title: string, category: string, fileUrl: string, fileSize?: number, uploadedById?: string) {
    return this.prisma.document.create({
      data: { condominiumId, title, category, fileUrl, fileSize, uploadedById },
    });
  }

  async findAll(condominiumId: string, category?: string, search?: string) {
    const where: any = { condominiumId };
    if (category) where.category = category;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const docs = await this.prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    // Buscar nomes dos uploaders
    const uploaderIds = docs.map(d => d.uploadedById).filter(Boolean);
    const uploaders = await this.prisma.person.findMany({
      where: { id: { in: uploaderIds as string[] } },
      select: { id: true, name: true },
    });

    return docs.map(doc => ({
      ...doc,
      uploadedBy: uploaders.find(u => u.id === doc.uploadedById)?.name || 'Sistema',
    }));
  }

  async delete(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
