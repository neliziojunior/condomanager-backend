import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportParserService } from './report-parser.service';
import { UploadReportDto } from './dto/upload-report.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private parser: ReportParserService,
  ) {}

  /**
   * Processa o upload de um PDF de prestação de contas
   */
  async uploadAndProcess(
    file: Express.Multer.File,
    dto: UploadReportDto,
    condominiumId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Arquivo deve ser PDF');
    }

    const { year, month } = dto;

    // Verifica se já existe relatório desse mês
    const existing = await this.prisma.monthlyReport.findUnique({
      where: {
        condominiumId_year_month: { condominiumId, year, month },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe relatório para ${month}/${year}. Delete antes de reenviar.`,
      );
    }

    // Cria registro com status PROCESSING
    const report = await this.prisma.monthlyReport.create({
      data: {
        condominiumId,
        year,
        month,
        sourceFileUrl: file.path,
        sourceType: dto.sourceType || 'BRCONDOMINIO',
        parserVersion: 'v1',
        status: 'PROCESSING',
      },
    });

    try {
      // Lê o arquivo
      const buffer = fs.readFileSync(file.path);

      // Extrai texto do PDF
      const text = await this.parser.extractTextFromPdf(buffer);

      // Parseia a Seção 5
      const section5 = this.parser.parseSection5(text);

      // Atualiza o registro
      const updated = await this.prisma.monthlyReport.update({
        where: { id: report.id },
        data: {
          previousBalance: section5.previousBalance,
          totalRevenues: section5.totalRevenues,
          totalExpenses: section5.totalExpenses,
          currentBalance: section5.currentBalance,
          confidence: section5.confidence,
          extractedData: {
            section5: {
              previousBalance: section5.previousBalance,
              totalRevenues: section5.totalRevenues,
              totalExpenses: section5.totalExpenses,
              currentBalance: section5.currentBalance,
            },
          },
          status: section5.confidence >= 0.75 ? 'REVIEW' : 'FAILED',
          errorMessage:
            section5.confidence < 0.75
              ? 'Extração com baixa confiança. Revise manualmente.'
              : null,
        },
      });

      this.logger.log(
        `Relatório ${report.id} processado: status=${updated.status}, confiança=${section5.confidence}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(`Erro ao processar PDF: ${error.message}`, error.stack);

      await this.prisma.monthlyReport.update({
        where: { id: report.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw new BadRequestException(
        `Falha ao processar PDF: ${error.message}`,
      );
    }
  }

  /**
   * Lista relatórios do condomínio
   */
  async findAll(condominiumId: string) {
    return this.prisma.monthlyReport.findMany({
      where: { condominiumId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /**
   * Busca 1 relatório
   */
  async findOne(id: string, condominiumId: string) {
    const report = await this.prisma.monthlyReport.findUnique({
      where: { id },
    });

    if (!report || report.condominiumId !== condominiumId) {
      throw new BadRequestException('Relatório não encontrado');
    }

    return report;
  }

  /**
   * Aprova um relatório (marca como APPROVED)
   */
  async approve(id: string, condominiumId: string) {
    await this.findOne(id, condominiumId);

    return this.prisma.monthlyReport.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Deleta um relatório
   */
  async delete(id: string, condominiumId: string) {
    const report = await this.findOne(id, condominiumId);

    // Remove arquivo físico
    if (report.sourceFileUrl && fs.existsSync(report.sourceFileUrl)) {
      fs.unlinkSync(report.sourceFileUrl);
    }

    return this.prisma.monthlyReport.delete({ where: { id } });
  }
}
