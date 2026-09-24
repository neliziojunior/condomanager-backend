import { 
  Controller, Get, Post, Delete, Body, Param, Query, Req, 
  UseGuards, UseInterceptors, UploadedFile, Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  sendMessage(@Body() data: {
    content: string;
    receiverId?: string;
    attachmentUrl?: string;
    attachmentType?: string;
  }, @Req() req) {
    return this.chatService.sendMessage(req.user.condominiumId, req.user.id, data);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/chat',
      filename: (req, file, cb) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, name + extname(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return {
      url: `/chat/file/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOC',
      filename: file.originalname,
    };
  }

  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads/chat' });
  }

  @Get()
  getMessages(
    @Req() req,
    @Query('withPersonId') withPersonId?: string,
    @Query('search') search?: string,
  ) {
    return this.chatService.getMessages(req.user.condominiumId, req.user.id, {
      withPersonId,
      search,
    });
  }

  @Get('unread-count')
  getUnreadCount(@Req() req) {
    return this.chatService.getUnreadCount(req.user.condominiumId, req.user.id);
  }

  @Get('contacts')
  getContacts(@Req() req) {
    return this.chatService.getContacts(req.user.condominiumId, req.user.id);
  }

  @Post('mark-read')
  markAsRead(@Body('senderId') senderId: string, @Req() req) {
    return this.chatService.markAsRead(req.user.condominiumId, req.user.id, senderId);
  }

  @Delete(':id')
  deleteMessage(@Param('id') id: string, @Req() req) {
    return this.chatService.deleteMessage(id, req.user.id);
  }
}
