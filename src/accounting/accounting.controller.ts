import { Controller, Get, Post, Body, Req, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountingService } from './accounting.service';
import { FiscalObligationsService } from './fiscal-obligations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(
    private accountingService: AccountingService,
    private fiscalService: FiscalObligationsService,
  ) {}

  @Post('import')
  importEntries(@Body() data: any, @Req() req) {
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

  @Get('relatorio-anual')
  async relatorioAnual(@Req() req) {
    return this.accountingService.getRelatorioAnual(req.user.condominiumId);
  }

  @Get('obrigacoes')
  async obrigacoes(@Query('ano') ano: string, @Query('mes') mes: string) {
    return this.fiscalService.getObrigacoes(Number(ano), Number(mes));
  }
}
