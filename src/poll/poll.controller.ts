import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PollService } from './poll.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollController {
  constructor(
    private pollService: PollService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() data: any, @Req() req) {
    const poll = await this.pollService.create(req.user.condominiumId, req.user.id, data);

    // ✅ Postar automaticamente no chat
    const optionsText = data.options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n');
    await this.prisma.chatMessage.create({
      data: {
        condominiumId: req.user.condominiumId,
        senderId: req.user.id,
        content: `🗳️ *NOVA ENQUETE:* ${data.title}\n\n${data.description || ''}\n\n${optionsText}\n\nVote na aba Enquetes!`,
        isGroup: true,
      },
    });

    return poll;
  }

  @Get()
  findAll(@Req() req) {
    return this.pollService.findAll(req.user.condominiumId);
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body('options') options: number[], @Req() req) {
    return this.pollService.vote(id, req.user.id, options);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.pollService.getResults(id);
  }

  @Put(':id/close')
  close(@Param('id') id: string) {
    return this.pollService.close(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pollService.delete(id);
  }
}
