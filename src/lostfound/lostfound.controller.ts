import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LostFoundService } from './lostfound.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lostfound')
@UseGuards(JwtAuthGuard)
export class LostFoundController {
  constructor(private service: LostFoundService) {}

  @Post()
  create(@Body() data: { title: string; description: string; type?: string; location?: string }, @Req() req) {
    return this.service.create(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  findAll(@Req() req, @Query('type') type?: string) {
    return this.service.findAll(req.user.condominiumId, type);
  }

  @Put(':id/resolve')
  markResolved(@Param('id') id: string) {
    return this.service.markResolved(id);
  }
}
