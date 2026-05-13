import { 
  Controller, Post, Get, Body, Req, UseGuards, UseInterceptors, 
  UploadedFile, Param, Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  create(@Body() dto: any, @Req() req) {
    return this.expenseService.create(dto, req.user.condominiumId);
  }

  @Post('suggest-category')
  suggestCategory(@Body() dto: any, @Req() req) {
    return this.expenseService.suggestCategory(dto, req.user.condominiumId);
  }

  @Get()
  getAll(@Req() req) {
    return this.expenseService.findAll(req.user.condominiumId);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/comprovantes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas JPG, PNG e PDF são permitidos'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    const fileUrl = `/expenses/file/${file.filename}`;
    return this.expenseService.attachDocument(id, fileUrl);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `./uploads/comprovantes/${filename}`;
    if (fs.existsSync(filePath)) {
      return res.sendFile(filename, { root: './uploads/comprovantes' });
    }
    return res.status(404).json({ message: 'Arquivo não encontrado' });
  }

  @Post(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @Body('paymentDate') paymentDate: string) {
    return this.expenseService.markAsPaid(id, paymentDate);
  }
}
