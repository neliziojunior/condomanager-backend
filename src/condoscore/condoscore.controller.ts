import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CondoScoreService } from './condoscore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('condoscore')
export class CondoScoreController {
  constructor(private condoScoreService: CondoScoreService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getScore(@Req() req) {
    return this.condoScoreService.calculateScore(req.user.condominiumId);
  }

  // Rota pública para transparência
  @Get('public/:condominiumId')
  async getPublicScore(@Param('condominiumId') condominiumId: string) {
    return this.condoScoreService.calculateScore(condominiumId);
  }
}
