import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ✅ Enviar mensagem (grupo ou privada)
  async sendMessage(condominiumId: string, senderId: string, data: {
    content: string;
    receiverId?: string;
    attachmentUrl?: string;
    attachmentType?: string;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        condominiumId,
        senderId,
        content: data.content,
        receiverId: data.receiverId || null,
        isGroup: !data.receiverId,
        attachmentUrl: data.attachmentUrl,
        attachmentType: data.attachmentType,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
  }

  // ✅ Buscar mensagens (grupo OU conversa privada com pessoa específica)
  async getMessages(condominiumId: string, currentUserId: string, options: {
    withPersonId?: string;
    search?: string;
    limit?: number;
  }) {
    const where: any = {
      condominiumId,
      isDeleted: false,
    };

    // Filtro de busca
    if (options.search) {
      where.content = { contains: options.search, mode: 'insensitive' };
    }

    // ✅ Mensagens do grupo
    if (!options.withPersonId) {
      where.isGroup = true;
    } else {
      // ✅ Mensagens privadas entre dois usuários
      where.isGroup = false;
      where.OR = [
        { senderId: currentUserId, receiverId: options.withPersonId },
        { senderId: options.withPersonId, receiverId: currentUserId },
      ];
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
    });

    return messages.reverse(); // Mais antigas primeiro
  }

  // ✅ Marcar mensagens como lidas
  async markAsRead(condominiumId: string, currentUserId: string, senderId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        condominiumId,
        senderId,
        receiverId: currentUserId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  // ✅ Contador de mensagens não lidas
  async getUnreadCount(condominiumId: string, currentUserId: string) {
    return this.prisma.chatMessage.count({
      where: {
        condominiumId,
        receiverId: currentUserId,
        readAt: null,
        isDeleted: false,
      },
    });
  }

  // ✅ Lista de contatos (moradores + admin) com contador de não lidas
  async getContacts(condominiumId: string, currentUserId: string) {
    const persons = await this.prisma.person.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { unit: { condominiumId } },
          { syndicOfId: condominiumId },
        ],
      },
      select: {
        id: true,
        name: true,
        role: true,
        unit: { select: { number: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Contar não lidas por pessoa
    const contacts = await Promise.all(
      persons.map(async (p) => {
        const unread = await this.prisma.chatMessage.count({
          where: {
            condominiumId,
            senderId: p.id,
            receiverId: currentUserId,
            readAt: null,
          },
        });
        return { ...p, unread };
      }),
    );

    return contacts;
  }

  // ✅ Excluir mensagem (soft delete)
  async deleteMessage(id: string, currentUserId: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id } });
    if (!message || message.senderId !== currentUserId) {
      throw new Error('Você só pode excluir suas próprias mensagens');
    }

    return this.prisma.chatMessage.update({
      where: { id },
      data: { isDeleted: true, content: 'Mensagem excluída' },
    });
  }
}
