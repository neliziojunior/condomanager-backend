import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('occurrences')
@UseGuards(JwtAuthGuard)
export class OccurrenceController {
  constructor(private occurrenceService: OccurrenceService) {}

  @Post()
  create(@Body() data: { unitId?: string; title: string; description: string; type?: string }, @Req() req) {
    return this.occurrenceService.create(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  findAll(@Req() req, @Query('type') type?: string, @Query('status') status?: string) {
    return this.occurrenceService.findAll(req.user.condominiumId, { type, status });
  }

  @Put(':id')
  updateStatus(@Param('id') id: string, @Body() data: { status: string; response?: string }) {
    return this.occurrenceService.updateStatus(id, data.status, data.response);
  }
}
