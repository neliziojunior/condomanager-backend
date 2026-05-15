import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: { number: string; floor?: number; type?: any; area?: number }) {
    if (!condominiumId) throw new BadRequestException('Condomínio não encontrado');

    return this.prisma.unit.create({
      data: {
        number: data.number,
        floor: data.floor,
        type: data.type || 'APARTMENT',
        area: data.area,
        condominium: { connect: { id: condominiumId } }
      },
    });
  }

  async findAll(condominiumId: string) {
    if (!condominiumId) {
      throw new BadRequestException('Condomínio não encontrado. Faça login novamente.');
    }

    return this.prisma.unit.findMany({
      where: { condominiumId },
      include: {
        residents: { select: { id: true, name: true, email: true, phone: true, role: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { number: 'asc' },
    });
  }

  async addResident(unitId: string, data: { name: string; email: string; phone?: string; isOwner?: boolean }) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    return this.prisma.person.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.isOwner ? 'OWNER' : 'RESIDENT',
        unit: { connect: { id: unitId } }
      },
    });
  }

  async removeResident(personId: string) {
    return this.prisma.person.update({
      where: { id: personId },
      data: { unitId: null },
    });
  }

  async getResidents(unitId: string) {
    return this.prisma.person.findMany({
      where: { unitId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }
}
