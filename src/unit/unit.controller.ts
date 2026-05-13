import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
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

  @Post(':id/residents')
  addResident(@Param('id') id: string, @Body() data: { name: string; email: string; phone?: string; isOwner?: boolean }) {
    return this.unitService.addResident(id, data);
  }

  @Delete(':id/residents/:personId')
  removeResident(@Param('personId') personId: string) {
    return this.unitService.removeResident(personId);
  }

  @Get(':id/residents')
  getResidents(@Param('id') id: string) {
    return this.unitService.getResidents(id);
  }
}
