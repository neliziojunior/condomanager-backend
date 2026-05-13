import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: { number: string; floor?: number; type?: any; area?: number }) {
    return this.prisma.unit.create({
      data: {
        number: data.number,
        floor: data.floor,
        type: data.type || 'APARTMENT',
        area: data.area,
        condominium: {
          connect: { id: condominiumId }
        }
      },
    });
  }

  async findAll(condominiumId: string) {
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
    const person = await this.prisma.person.create({
      data: {
        name: data.name,
        email: data.email,
        password: await this.hashPassword('123456'),
        phone: data.phone,
        role: data.isOwner ? 'OWNER' : 'RESIDENT',
        unit: {
          connect: { id: unitId }
        }
      },
    });
    return person;
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

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 10);
  }
}
