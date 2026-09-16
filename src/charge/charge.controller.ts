import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ChargeService } from './charge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('charges')
@UseGuards(JwtAuthGuard)
export class ChargeController {
  constructor(private chargeService: ChargeService) {}

  @Post()
  create(@Body() data: {
    unitId: string;
    description: string;
    amount: number;
    dueDate: string;
    type: 'PIX' | 'BOLETO';
  }, @Req() req) {
    return this.chargeService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.chargeService.findAll(req.user.condominiumId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.chargeService.getById(id);
  }
}
