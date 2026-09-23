import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as PDFDocument from 'pdfkit';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private prisma: PrismaService) {}

  @Get('pdf')
  async generatePDF(@Req() req, @Res() res: Response, @Query('competencia') competencia?: string) {
    const condominiumId = req.user.condominiumId;
    const competenciaAtual = competencia || new Date().toISOString().slice(0, 7);

    const employees = await this.prisma.employee.findMany({
      where: { condominiumId, status: 'ATIVO' },
      orderBy: { name: 'asc' },
    });

    const condominium = await this.prisma.condominium.findUnique({
      where: { id: condominiumId },
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=folha-pagamento-${competenciaAtual}.pdf`);
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(16).text(`FOLHA DE PAGAMENTO - ${competenciaAtual}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`${condominium?.name || ''}`, { align: 'center' });
    doc.text(`CNPJ: ${condominium?.cnpj || '-'}`, { align: 'center' });
    doc.moveDown(1);

    // Totais gerais
    const totalProventos = employees.reduce((s, e) => s + (e.totalProventos || 0), 0);
    const totalDescontos = employees.reduce((s, e) => s + (e.totalDescontos || 0), 0);
    const totalLiquido = employees.reduce((s, e) => s + (e.totalLiquido || 0), 0);
    const totalFGTS = employees.reduce((s, e) => s + (e.fgtsEmpresa || 0), 0);
    const totalINSS = employees.reduce((s, e) => s + (e.inssEmpresa || 0), 0);
    const custoTotal = employees.reduce((s, e) => s + (e.custoTotalEmpresa || 0), 0);

    // Tabela
    const tableTop = 180;
    const colWidths = [140, 90, 80, 80, 80, 80, 90];
    const headers = ['Funcionário', 'Cargo', 'Salário Base', 'Proventos', 'Descontos', 'Líquido', 'Custo Total'];
    const startX = 40;

    // Cabeçalho da tabela
    doc.fontSize(9).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    doc.moveTo(startX, tableTop + 15).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), tableTop + 15).stroke();

    // Linhas
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 22;
    for (const emp of employees) {
      if (y > 500) {
        doc.addPage();
        y = 40;
      }
      
      x = startX;
      const row = [
        emp.name.substring(0, 25),
        emp.cargo || '-',
        `R$ ${(emp.salarioBase || 0).toFixed(2)}`,
        `R$ ${(emp.totalProventos || 0).toFixed(2)}`,
        `R$ ${(emp.totalDescontos || 0).toFixed(2)}`,
        `R$ ${(emp.totalLiquido || 0).toFixed(2)}`,
        `R$ ${(emp.custoTotalEmpresa || 0).toFixed(2)}`,
      ];
      
      row.forEach((cell, i) => {
        doc.text(cell, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 15;
    }

    // Linha de total
    y += 5;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
    y += 10;
    
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('TOTAIS GERAIS', startX, y);
    y += 15;
    doc.fontSize(9);
    doc.text(`Total Proventos: R$ ${totalProventos.toFixed(2)}`, startX, y);
    doc.text(`Total Descontos: R$ ${totalDescontos.toFixed(2)}`, startX + 200, y);
    doc.text(`Total Líquido: R$ ${totalLiquido.toFixed(2)}`, startX + 400, y);
    y += 15;
    doc.text(`FGTS Empresa: R$ ${totalFGTS.toFixed(2)}`, startX, y);
    doc.text(`INSS Empresa: R$ ${totalINSS.toFixed(2)}`, startX + 200, y);
    doc.text(`CUSTO TOTAL: R$ ${custoTotal.toFixed(2)}`, startX + 400, y, { underline: true });

    // Rodapé
    y += 30;
    doc.fontSize(8).font('Helvetica').text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} pelo sistema CondoPro`,
      startX,
      y,
      { align: 'center', width: colWidths.reduce((a, b) => a + b, 0) }
    );

    doc.end();
  }

  @Get('excel')
  async generateExcel(@Req() req, @Res() res: Response, @Query('competencia') competencia?: string) {
    const condominiumId = req.user.condominiumId;
    const competenciaAtual = competencia || new Date().toISOString().slice(0, 7);

    const employees = await this.prisma.employee.findMany({
      where: { condominiumId },
      orderBy: { name: 'asc' },
    });

    // Gerar CSV (mais simples e funciona no Excel)
    const headers = [
      'Nome', 'Cargo', 'CPF', 'CTPS', 'Admissão', 'Salário Base',
      'Periculosidade', 'Adic. Noturno', 'Insalubridade',
      'Vale Transporte', 'Vale Refeição', 'Horas Extras 50%', 'Horas Extras 100%',
      'Total Proventos', 'INSS', 'IRRF', 'Faltas',
      'Total Descontos', 'Líquido', 'FGTS Empresa', 'INSS Empresa', 'Custo Total'
    ];

    let csv = headers.join(';') + '\n';

    for (const emp of employees) {
      const row = [
        emp.name,
        emp.cargo || '',
        emp.cpf || '',
        `${emp.ctpsNumero || ''}/${emp.ctpsSerie || ''}`,
        emp.dataAdmissao ? new Date(emp.dataAdmissao).toLocaleDateString('pt-BR') : '',
        (emp.salarioBase || 0).toFixed(2),
        (emp.periculosidade || 0).toFixed(2),
        (emp.adicionalNoturno || 0).toFixed(2),
        (emp.insalubridade || 0).toFixed(2),
        (emp.valeTransporte || 0).toFixed(2),
        (emp.valeRefeicao || 0).toFixed(2),
        (emp.horasExtras50 || 0).toFixed(2),
        (emp.horasExtras100 || 0).toFixed(2),
        (emp.totalProventos || 0).toFixed(2),
        (emp.inssFuncionario || 0).toFixed(2),
        (emp.irrf || 0).toFixed(2),
        (emp.faltas || 0).toFixed(2),
        (emp.totalDescontos || 0).toFixed(2),
        (emp.totalLiquido || 0).toFixed(2),
        (emp.fgtsEmpresa || 0).toFixed(2),
        (emp.inssEmpresa || 0).toFixed(2),
        (emp.custoTotalEmpresa || 0).toFixed(2),
      ];
      csv += row.join(';') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=folha-pagamento-${competenciaAtual}.csv`);
    res.send('\uFEFF' + csv); // BOM para acentos
  }
}
