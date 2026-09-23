import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: { 
    number: string; 
    block?: string;
    floor?: number; 
    type?: any; 
    parkingSpots?: number;
  }) {
    return this.prisma.unit.create({
      data: { ...data, condominiumId },
    });
  }

  async findAll(condominiumId: string) {
    return this.prisma.unit.findMany({ 
      where: { condominiumId }, 
      include: {
        residents: { select: { id: true, name: true, email: true, phone: true, role: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { number: 'asc' } 
    });
  }

  // ✅ EDITAR
  async update(id: string, data: { 
    number?: string; 
    block?: string;
    floor?: number; 
    type?: any; 
    parkingSpots?: number;
  }) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    return this.prisma.unit.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.unit.delete({ where: { id } });
  }

  async addResident(unitId: string, data: { name: string; email: string; phone?: string; isOwner?: boolean }) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    return this.prisma.person.create({
      data: { 
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword, 
        role: data.isOwner ? 'OWNER' : 'RESIDENT', 
        unitId 
      },
    });
  }

  async removeResident(personId: string) {
    return this.prisma.person.delete({ where: { id: personId } });
  }
}
