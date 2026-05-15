import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visitors')
@UseGuards(JwtAuthGuard)
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Post()
  create(@Body() data: { unitId: string; name: string; document?: string; reason?: string }, @Req() req) {
    return this.visitorService.create(req.user.condominiumId, {
      ...data,
      authorizedBy: req.user.id,
    });
  }

  @Get()
  findAll(@Req() req, @Query('status') status?: string) {
    return this.visitorService.findAll(req.user.condominiumId, status);
  }

  @Put(':id/exit')
  registerExit(@Param('id') id: string) {
    return this.visitorService.registerExit(id);
  }

  @Get('active-count')
  activeCount(@Req() req) {
    return this.visitorService.activeCount(req.user.condominiumId);
  }
}
