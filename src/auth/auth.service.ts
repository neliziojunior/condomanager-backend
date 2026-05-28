import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: { email: string; name: string; password: string; role?: string }) {
    const existing = await this.prisma.person.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const person = await this.prisma.person.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: (dto.role as any) || 'SYNDIC',
      },
    });

    return this.generateToken(person);
  }

  async login(dto: { email: string; password: string }) {
    const person = await this.prisma.person.findUnique({ where: { email: dto.email } });
    if (!person) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, person.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return this.generateToken(person);
  }

  private generateToken(person: any) {
    const payload = { sub: person.id, email: person.email, role: person.role };
    return {
      access_token: jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }),
    };
  }
}
