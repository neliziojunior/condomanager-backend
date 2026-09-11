import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CondominiumService } from './condominium.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import axios from 'axios';

@Controller('condominium')
@UseGuards(JwtAuthGuard)
export class CondominiumController {
  constructor(private condominiumService: CondominiumService) {}

  @Post()
  create(@Body() dto: any, @Req() req) {
    return this.condominiumService.create(dto, req.user.id);
  }

  @Get('me')
  findByUser(@Req() req) {
    return this.condominiumService.findByUser(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.condominiumService.getById(id);
  }

  // ✅ NOVO: Salvar configuração de pagamento
  @Put('payment-config')
  async updatePaymentConfig(
    @Body() data: { asaasApiKey: string; asaasWalletId: string; asaasEnabled: boolean },
    @Req() req,
  ) {
    return this.condominiumService.updatePaymentConfig(req.user.condominiumId, data);
  }

  // ✅ NOVO: Testar conexão com Asaas
  @Post('test-asaas')
  async testAsaas(@Body('asaasApiKey') asaasApiKey: string) {
    try {
      const response = await axios.get('https://api.asaas.com/v3/customers', {
        headers: { access_token: asaasApiKey },
        params: { limit: 1 },
      });
      return { success: true, message: 'Conexão OK' };
    } catch (error: any) {
      throw new Error('API Key inválida ou sem permissão');
    }
  }
}
