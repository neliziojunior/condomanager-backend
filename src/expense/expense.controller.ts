import { 
  Controller, Post, Get, Body, Req, UseGuards, UseInterceptors, 
  UploadedFile, Param, Res 
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
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const fileUrl = `/expenses/file/${file.filename}`;
    return this.expenseService.attachDocument(id, fileUrl);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads/comprovantes' });
  }

  @Post(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @Body('paymentDate') paymentDate: string) {
    return this.expenseService.markAsPaid(id, paymentDate);
  }

  @Get('report/pdf')
  async generateReport(@Req() req, @Res() res: Response) {
    const expenses = await this.expenseService.findAll(req.user.condominiumId);
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-despesas.pdf');
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).text('Relatório de Despesas', { align: 'center' });
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.moveDown();

    // Tabela
    doc.fontSize(10);
    const tableTop = 150;
    const items = expenses.map(e => ({
      desc: e.description.substring(0, 30),
      cat: e.category?.name || '-',
      value: `R$ ${e.amount.toFixed(2)}`,
      date: new Date(e.dueDate).toLocaleDateString('pt-BR'),
      status: e.status === 'PAID' ? 'Pago' : 'Pendente'
    }));

    // Cabeçalho da tabela
    doc.font('Helvetica-Bold');
    doc.text('Descrição', 50, tableTop);
    doc.text('Categoria', 250, tableTop);
    doc.text('Valor', 350, tableTop);
    doc.text('Vencimento', 430, tableTop);
    doc.text('Status', 520, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(570, tableTop + 15).stroke();
    
    // Linhas
    doc.font('Helvetica');
    let y = tableTop + 25;
    items.forEach(item => {
      doc.text(item.desc, 50, y);
      doc.text(item.cat, 250, y);
      doc.text(item.value, 350, y);
      doc.text(item.date, 430, y);
      doc.text(item.status, 520, y);
      y += 20;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Total
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    doc.moveTo(50, y + 5).lineTo(570, y + 5).stroke();
    doc.font('Helvetica-Bold');
    doc.text(`Total: R$ ${total.toFixed(2)}`, 350, y + 15);

    doc.end();
  }
}
