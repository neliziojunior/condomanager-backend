import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { CondominiumService } from './condominium.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('condominium')
@UseGuards(JwtAuthGuard)
export class CondominiumController {
  constructor(private condominiumService: CondominiumService) {}

  @Post()
  create(@Body() dto: { name: string; address: string; cnpj?: string; monthlyFee?: number }, @Req() req) {
    return this.condominiumService.create(dto, req.user.id);
  }

  @Get('me')
  getMyCondominium(@Req() req) {
    return this.condominiumService.findByUser(req.user.id);
  }
}