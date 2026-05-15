import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitController {
  constructor(
    private unitService: UnitService,
    private prisma: PrismaService,
  ) {}

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

  // Pets
  @Post('residents/:personId/pets')
  addPet(@Param('personId') personId: string, @Body() data: { name: string; type?: string; breed?: string; color?: string }) {
    return this.prisma.pet.create({ data: { ...data, personId } });
  }

  @Get('residents/:personId/pets')
  getPets(@Param('personId') personId: string) {
    return this.prisma.pet.findMany({ where: { personId } });
  }

  @Delete('pets/:id')
  deletePet(@Param('id') id: string) {
    return this.prisma.pet.delete({ where: { id } });
  }

  // Vehicles
  @Post('residents/:personId/vehicles')
  addVehicle(@Param('personId') personId: string, @Body() data: { brand: string; model: string; plate: string; color?: string; year?: number }) {
    return this.prisma.vehicle.create({ data: { ...data, personId } });
  }

  @Get('residents/:personId/vehicles')
  getVehicles(@Param('personId') personId: string) {
    return this.prisma.vehicle.findMany({ where: { personId } });
  }

  @Delete('vehicles/:id')
  deleteVehicle(@Param('id') id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
