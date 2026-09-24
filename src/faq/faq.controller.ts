import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('faq')
@UseGuards(JwtAuthGuard)
export class FaqController {
  constructor(private faqService: FaqService) {}

  @Post()
  create(@Body() data: { question: string; answer: string; keywords: string[]; category?: string }, @Req() req) {
    return this.faqService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.faqService.findAll(req.user.condominiumId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.faqService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.faqService.delete(id);
  }

  // ✅ Perguntar ao bot
  @Post('ask')
  ask(@Body('question') question: string, @Req() req) {
    return this.faqService.ask(req.user.condominiumId, question);
  }
}
