import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body() data: {
    unitId: string;
    title: string;
    description: string;
    priority?: string;
    photos?: string[];
  }, @Req() req) {
    return this.maintenanceService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('unitId') unitId?: string,
  ) {
    return this.maintenanceService.findAll(req.user.condominiumId, { status, priority, unitId });
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.maintenanceService.updateStatus(id, status);
  }

  @Put(':id/priority')
  updatePriority(@Param('id') id: string, @Body('priority') priority: string) {
    return this.maintenanceService.updatePriority(id, priority);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.maintenanceService.delete(id);
  }
}
