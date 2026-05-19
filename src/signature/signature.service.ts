import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SignatureService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    documentId: string;
    personId: string;
    signatureData: string; // Base64 da assinatura
    ip?: string;
  }) {
    return this.prisma.documentSignature.create({
      data: {
        condominiumId,
        documentId: data.documentId,
        personId: data.personId,
        signatureData: data.signatureData,
        ip: data.ip || '127.0.0.1',
        signedAt: new Date(),
      },
      include: {
        person: { select: { name: true, email: true } },
      },
    });
  }

  async getSignatures(documentId: string) {
    return this.prisma.documentSignature.findMany({
      where: { documentId },
      include: { person: { select: { name: true, email: true } } },
      orderBy: { signedAt: 'desc' },
    });
  }

  async hasSigned(documentId: string, personId: string) {
    const sig = await this.prisma.documentSignature.findFirst({
      where: { documentId, personId },
    });
    return { signed: !!sig, signature: sig };
  }
}
