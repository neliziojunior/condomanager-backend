import {
  Controller, Post, Get, Put, Delete, Body, Req, UseGuards, UseInterceptors,
  UploadedFile, Param, Res, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as PDFDocument from 'pdfkit';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  create(@Body() dto: any, @Req() req) {
    return this.expenseService.create(dto, req.user.condominiumId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }

  @Post('suggest-category')
  suggestCategory(@Body() dto: any, @Req() req) {
    return this.expenseService.suggestCategory(dto, req.user.condominiumId);
  }

  @Get()
  getAll(
    @Req() req,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenseService.findAll(req.user.condominiumId, {
      status, categoryId, startDate, endDate,
    });
  }

  @Get('summary')
  getSummary(@Req() req, @Query('month') month?: string) {
    return this.expenseService.getSummary(req.user.condominiumId, month);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/comprovantes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.expenseService.attachDocument(id, `/expenses/file/${file.filename}`);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads/comprovantes' });
  }

  @Post(':id/mark-paid')
  markAsPaid(
    @Param('id') id: string,
    @Body('paymentDate') paymentDate: string,
    @Body('paidAmount') paidAmount?: number,
  ) {
    return this.expenseService.markAsPaid(id, paymentDate, paidAmount);
  }

  @Get('report/pdf')
  async generateReport(@Req() req, @Res() res: Response, @Query('month') month?: string) {
    const expenses = await this.expenseService.findAll(req.user.condominiumId);
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-despesas.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Relatório de Despesas', { align: 'center' });
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.moveDown();

    const tableTop = 150;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Descrição', 50, tableTop);
    doc.text('Categoria', 250, tableTop);
    doc.text('Valor', 350, tableTop);
    doc.text('Vencimento', 430, tableTop);
    doc.text('Status', 520, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(570, tableTop + 15).stroke();

    doc.font('Helvetica');
    let y = tableTop + 25;
    let total = 0;
    expenses.forEach(e => {
      doc.text(e.description.substring(0, 30), 50, y);
      doc.text(e.category?.name || '-', 250, y);
      doc.text(`R$ ${e.amount.toFixed(2)}`, 350, y);
      doc.text(new Date(e.dueDate).toLocaleDateString('pt-BR'), 430, y);
      doc.text(e.status === 'PAID' ? 'Pago' : 'Pendente', 520, y);
      total += e.amount;
      y += 20;
      if (y > 700) { doc.addPage(); y = 50; }
    });

    doc.moveTo(50, y + 5).lineTo(570, y + 5).stroke();
    doc.font('Helvetica-Bold').text(`Total: R$ ${total.toFixed(2)}`, 350, y + 15);
    doc.end();
  }
}
