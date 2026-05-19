import { Controller, Get, Post, Body, Req, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  // ✅ NOVO: Upload de arquivo CSV
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads/csv',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos CSV são permitidos'), false);
      }
    }
  }))
  async uploadCsv(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const fileContent = fs.readFileSync(file.path, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,        // Primeira linha = cabeçalho
      skip_empty_lines: true,
      trim: true,
      delimiter: ',',       // ou ';' se for separado por ponto e vírgula
      relax_column_count: true,
    });

    // Mapear colunas comuns (aceita nomes em português ou inglês)
    const entries = records.map((row: any) => ({
      description: row.descricao || row.description || row.Descrição || row.Descricao || row.DESCRIÇÃO || '',
      amount: parseFloat(row.valor || row.Valor || row.VALOR || row.amount || row.Amount || '0'),
      date: row.data || row.Data || row.DATA || row.date || row.Date || new Date().toISOString(),
      type: row.tipo || row.Tipo || row.TIPO || row.type || row.Type || 'EXPENSE',
    })).filter((e: any) => e.description && e.amount > 0);

    // Remover arquivo temporário
    fs.unlinkSync(file.path);

    // Importar
    await this.accountingService.importEntries(req.user.condominiumId, entries);
    
    return { imported: entries.length, entries };
  }

  // Importar via JSON (manual)
  @Post('import')
  importEntries(@Body() data: { entries: { description: string; amount: number; date: string; type?: string }[] }, @Req() req) {
    return this.accountingService.importEntries(req.user.condominiumId, data.entries);
  }

  @Post('sync')
  syncSystem(@Req() req) {
    return this.accountingService.syncSystemEntries(req.user.condominiumId);
  }

  @Post('compare')
  compare(@Req() req) {
    return this.accountingService.compareEntries(req.user.condominiumId);
  }

  @Get()
  findAll(@Req() req, @Query('source') source?: string) {
    return this.accountingService.findAll(req.user.condominiumId, source);
  }

  @Get('summary')
  getSummary(@Req() req) {
    return this.accountingService.getSummary(req.user.condominiumId);
  }
}
