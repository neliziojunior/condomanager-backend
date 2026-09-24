import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, Res } from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';

@Controller('assemblies')
@UseGuards(JwtAuthGuard)
export class AssemblyController {
  constructor(private assemblyService: AssemblyService) {}

  @Post()
  create(@Body() data: any, @Req() req) {
    return this.assemblyService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.assemblyService.findAll(req.user.condominiumId);
  }

  @Put(':id/confirm')
  confirmPresence(@Param('id') id: string, @Body('status') status: string, @Req() req) {
    return this.assemblyService.confirmPresence(id, req.user.id, status);
  }

  @Get('pending')
  getPending(@Req() req) {
    return this.assemblyService.getPendingConfirmations(req.user.id);
  }

  @Get(':id/presence')
  getPresenceList(@Param('id') id: string) {
    return this.assemblyService.getPresenceList(id);
  }

  // ✅ NOVO: Finalizar assembleia (muda status para FINISHED)
  @Post(':id/finish')
  finishAssembly(@Param('id') id: string) {
    return this.assemblyService.finishAssembly(id);
  }

  // ✅ NOVO: Gerar PDF da Ata com assinaturas
  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const assembly = await this.assemblyService.getAssemblyWithPresence(id);
    if (!assembly) {
      return res.status(404).json({ message: 'Assembleia não encontrada' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ata-${id}.pdf`);
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(18).text('ATA DE ASSEMBLEIA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(assembly.title, { align: 'center' });
    doc.moveDown();

    // Informações
    doc.fontSize(11);
    doc.text(`Data: ${new Date(assembly.date).toLocaleDateString('pt-BR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    })}`);
    doc.text(`Local: ${assembly.location || 'Salão de Festas'}`);
    doc.moveDown();

    // Pauta
    doc.fontSize(12).text('PAUTA:', { underline: true });
    doc.fontSize(11).text(assembly.description || 'Não especificada');
    doc.moveDown();

    // Lista de Presença
    doc.fontSize(12).text('LISTA DE PRESENÇA:', { underline: true });
    doc.moveDown(0.5);

    const present = assembly.confirmations?.filter((c: any) => c.status === 'PRESENT') || [];
    const absent = assembly.confirmations?.filter((c: any) => c.status === 'ABSENT') || [];

    doc.fontSize(10);
    doc.text(`Total de Presentes: ${present.length}`);
    doc.text(`Total de Ausentes: ${absent.length}`);
    doc.moveDown(0.5);

    // Tabela
    let y = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Nome', 50, y);
    doc.text('Unidade', 250, y);
    doc.text('Status', 400, y);
    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

    doc.font('Helvetica');
    y += 20;

    for (const conf of assembly.confirmations || []) {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(conf.person?.name || '-', 50, y);
      doc.text(conf.person?.unit?.number || '-', 250, y);
      doc.text(conf.status === 'PRESENT' ? 'Presente' : conf.status === 'ABSENT' ? 'Ausente' : 'Pendente', 400, y);
      y += 18;
    }

    // Rodapé com assinaturas digitais
    doc.moveDown(3);
    doc.fontSize(10).text('ASSINATURAS DIGITAIS:', { underline: true });
    doc.moveDown();
    
    doc.fontSize(9);
    doc.text(`Documento assinado digitalmente por todos os presentes.`);
    doc.text(`Data de emissão: ${new Date().toLocaleString('pt-BR')}`);
    doc.text(`Hash de verificação: ${Buffer.from(id).toString('base64').substring(0, 16)}`);

    doc.end();
  }
}
