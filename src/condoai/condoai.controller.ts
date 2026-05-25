import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CondoAIService } from './condoai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('condoai')
@UseGuards(JwtAuthGuard)
export class CondoAIController {
  constructor(private condoAIService: CondoAIService) {}

  @Get('predictions')
  async getPredictions(@Req() req) {
    return this.condoAIService.getPredictions(req.user.condominiumId);
  }
}
