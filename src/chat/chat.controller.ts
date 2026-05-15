import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  sendMessage(@Body() data: { content: string; receiverId?: string }, @Req() req) {
    return this.chatService.sendMessage(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  getMessages(@Req() req) {
    return this.chatService.getMessages(req.user.condominiumId);
  }

  @Get('residents')
  getResidents(@Req() req) {
    return this.chatService.getResidents(req.user.condominiumId);
  }
}
