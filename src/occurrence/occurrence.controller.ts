import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('occurrences')
@UseGuards(JwtAuthGuard)
export class OccurrenceController {
  constructor(private occurrenceService: OccurrenceService) {}

  @Post()
  create(@Body() data: any, @Req() req) {
    return this.occurrenceService.create(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.occurrenceService.findAll(req.user.condominiumId, { type, status, priority });
  }

  @Put(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() data: { status: string; response?: string },
    @Req() req,
  ) {
    return this.occurrenceService.updateStatus(id, data.status, data.response, req.user.name);
  }

  @Put(':id/priority')
  updatePriority(@Param('id') id: string, @Body('priority') priority: string) {
    return this.occurrenceService.updatePriority(id, priority);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.occurrenceService.delete(id);
  }
}
