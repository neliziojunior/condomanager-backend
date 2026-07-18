import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitController {
  constructor(private unitService: UnitService) {}

  @Post()
  create(@Body() data: { number: string; floor?: number; type?: string; area?: number }, @Req() req) {
    return this.unitService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.unitService.findAll(req.user.condominiumId);
  }

  // ✅ EDITAR UNIDADE
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { number?: string; floor?: number; type?: string; area?: number }) {
    return this.unitService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.unitService.remove(id);
  }
}
