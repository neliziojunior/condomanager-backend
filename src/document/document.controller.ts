import { Controller, Get, Post, Delete, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile, Body, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, name + extname(file.originalname));
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 }
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; category: string },
    @Req() req
  ) {
    return this.documentService.create(
      req.user.condominiumId,
      body.title,
      body.category,
      `/documents/file/${file.filename}`,
      file.size,
      req.user.id,
    );
  }

  @Get()
  findAll(
    @Req() req,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.documentService.findAll(req.user.condominiumId, category, search);
  }

  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads/documents' });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
