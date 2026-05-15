
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post()
  async chat(@Body() body: { message: string; history?: { role: string; content: string }[] }, @Req() req) {
    return this.chatbotService.chat(req.user.condominiumId, body.message, body.history || []);
  }
}
