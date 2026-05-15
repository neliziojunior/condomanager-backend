import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(condominiumId: string, senderId: string, data: { content: string; receiverId?: string }) {
    return this.prisma.chatMessage.create({
      data: {
        condominiumId,
        senderId,
        content: data.content,
        receiverId: data.receiverId || null,
        isGroup: !data.receiverId,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
  }

  async getMessages(condominiumId: string, limit = 50) {
    return this.prisma.chatMessage.findMany({
      where: { condominiumId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getResidents(condominiumId: string) {
    const units = await this.prisma.unit.findMany({
      where: { condominiumId },
      include: {
        residents: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return units.flatMap(u => u.residents);
  }
}
