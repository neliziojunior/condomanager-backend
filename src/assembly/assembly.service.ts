import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssemblyService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: { title: string; description?: string; date: string; location?: string }) {
    const assembly = await this.prisma.assembly.create({
      data: { ...data, condominiumId, date: new Date(data.date) },
    });
    const residents = await this.prisma.person.findMany({
      where: { unit: { condominiumId }, role: { in: ['RESIDENT', 'OWNER'] } },
    });
    for (const resident of residents) {
      await this.prisma.assemblyConfirmation.create({
        data: { assemblyId: assembly.id, personId: resident.id },
      });
    }
    return { assembly, notified: residents.length };
  }

  async findAll(condominiumId: string) {
    return this.prisma.assembly.findMany({
      where: { condominiumId },
      include: {
        confirmations: {
          include: { person: { select: { id: true, name: true, email: true, role: true, unit: { select: { number: true } } } } },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ✅ NOVO: Buscar assembleia com lista de presença completa
  async getAssemblyWithPresence(id: string) {
    return this.prisma.assembly.findUnique({
      where: { id },
      include: {
        confirmations: {
          include: { person: { select: { id: true, name: true, email: true, role: true, unit: { select: { number: true } } } } },
          orderBy: { person: { name: 'asc' } },
        },
      },
    });
  }

  async confirmPresence(assemblyId: string, personId: string, status: string) {
    return this.prisma.assemblyConfirmation.updateMany({
      where: { assemblyId, personId },
      data: { status, confirmedAt: new Date() },
    });
  }

  async getPendingConfirmations(personId: string) {
    return this.prisma.assemblyConfirmation.findMany({
      where: { personId, status: 'PENDING', assembly: { date: { gte: new Date() } } },
      include: { assembly: { select: { id: true, title: true, date: true, location: true } } },
      orderBy: { assembly: { date: 'asc' } },
    });
  }

  async getPresenceList(assemblyId: string) {
    return this.prisma.assemblyConfirmation.findMany({
      where: { assemblyId },
      include: { person: { select: { id: true, name: true, email: true, role: true, unit: { select: { number: true } } } } },
      orderBy: { person: { name: 'asc' } },
    });
  }
}
