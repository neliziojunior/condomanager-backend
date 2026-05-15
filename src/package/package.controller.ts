import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PackageService } from './package.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Post()
  create(@Body() data: {
    unitId: string;
    description: string;
    carrier?: string;
    trackingCode?: string;
    notes?: string;
  }, @Req() req) {
    return this.packageService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req, @Query('status') status?: string) {
    return this.packageService.findAll(req.user.condominiumId, status);
  }

  @Get('pending-count')
  getPendingCount(@Req() req) {
    return this.packageService.getPendingCount(req.user.condominiumId);
  }

  @Put(':id/retrieve')
  markRetrieved(@Param('id') id: string, @Body('retrievedBy') retrievedBy: string) {
    return this.packageService.markRetrieved(id, retrievedBy);
  }
}
