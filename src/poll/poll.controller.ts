import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PollService } from './poll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollController {
  constructor(private pollService: PollService) {}

  @Post()
  create(@Body() data: { title: string; description?: string; options: string[]; expiresAt?: string }, @Req() req) {
    return this.pollService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.pollService.findAll(req.user.condominiumId);
  }

  @Post(':id/vote')
  vote(@Param('id') id: string, @Body('option') option: number, @Req() req) {
    return this.pollService.vote(id, req.user.id, option);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.pollService.getResults(id);
  }
}
