import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async createSpace(condominiumId: string, data: { name: string; description?: string; capacity?: number; price?: number }) {
    return this.prisma.space.create({ data: { ...data, condominiumId } });
  }

  async getSpaces(condominiumId: string) {
    return this.prisma.space.findMany({ where: { condominiumId, isActive: true } });
  }

  async createReservation(data: { spaceId: string; unitId: string; personId: string; date: string; startTime: string; endTime: string; purpose?: string }) {
    return this.prisma.reservation.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: { space: true, unit: true, person: true },
    });
  }

  async getReservations(condominiumId: string, date?: string) {
    const where: any = { space: { condominiumId } };
    if (date) where.date = new Date(date);
    return this.prisma.reservation.findMany({
      where,
      include: { space: true, unit: { select: { number: true } }, person: { select: { name: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.reservation.update({ where: { id }, data: { status } });
  }
}
