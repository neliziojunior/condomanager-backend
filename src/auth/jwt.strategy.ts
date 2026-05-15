import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'cond-super-secret-key-change-in-production-2024',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.person.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // DEBUG: Ver se o syndicOfId existe
    console.log('JWT Validate - User:', user.email, 'CondominiumId:', user.syndicOfId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      condominiumId: user.syndicOfId,
    };
  }
}
