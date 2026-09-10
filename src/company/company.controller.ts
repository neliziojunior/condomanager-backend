import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  // ✅ Rota PÚBLICA (não precisa login) para consultar CNPJ
  @Get('cnpj/:cnpj')
  buscarCnpj(@Param('cnpj') cnpj: string) {
    return this.companyService.buscarCnpj(cnpj);
  }
}
