import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PollService } from './poll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollController {
  constructor(
    private pollService: PollService,
    private prisma: PrismaService, // ✅ NOVO: Para criar mensagem no chat
  ) {}

  @Post()
  async create(@Body() data: { title: string; description?: string; options: string[]; expiresAt?: string }, @Req() req) {
    const poll = await this.pollService.create(req.user.condominiumId, data);

    // ✅ NOVO: Criar mensagem automática no chat com a enquete
    const optionsText = data.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        condominiumId: req.user.condominiumId,
        senderId: req.user.id,
        content: `🗳️ *NOVA ENQUETE:* ${data.title}\n\n${data.description || ''}\n\n${optionsText}\n\nVote agora na aba Enquetes ou responda esta mensagem com o número da sua opção!`,
        isGroup: true,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return { poll, chatMessage };
  }

  @Get()
  findAll(@Req() req) {
    return this.pollService.findAll(req.user.condominiumId);
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body('option') option: number, @Req() req) {
    const vote = await this.pollService.vote(id, req.user.id, option);
    
    // ✅ NOVO: Notificar no chat que alguém votou
    const poll = await this.prisma.poll.findUnique({ where: { id }, select: { title: true, options: true } });
    const user = await this.prisma.person.findUnique({ where: { id: req.user.id }, select: { name: true } });
    
    await this.prisma.chatMessage.create({
      data: {
        condominiumId: req.user.condominiumId,
        senderId: req.user.id,
        content: `✅ ${user?.name} votou na opção "${poll?.options[option]}" na enquete "${poll?.title}"`,
        isGroup: true,
      },
    });

    // ✅ NOVO: Se todos votaram, postar resultado no chat
    const results = await this.pollService.getResults(id);
    const totalResidents = await this.prisma.person.count({
      where: { unit: { condominiumId: req.user.condominiumId }, role: { in: ['RESIDENT', 'OWNER'] } },
    });

    if (results.total >= totalResidents) {
      const resultsText = results.results.map((r: any) => `• ${r.option}: ${r.votes} voto(s) (${r.percentage.toFixed(0)}%)`).join('\n');
      await this.prisma.chatMessage.create({
        data: {
          condominiumId: req.user.condominiumId,
          senderId: req.user.id,
          content: `📊 *RESULTADO FINAL:* ${poll?.title}\n\n${resultsText}\n\nTotal: ${results.total} voto(s)`,
          isGroup: true,
        },
      });
    }

    return vote;
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.pollService.getResults(id);
  }
}
