import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
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

  // ✅ Salvar configuração de pagamento
  @Put('payment-config')
  async updatePaymentConfig(
    @Body() data: { asaasApiKey: string; asaasWalletId: string; asaasEnabled: boolean },
    @Req() req,
  ) {
    return this.condominiumService.updatePaymentConfig(req.user.condominiumId, data);
  }

  // ✅ Testar conexão com Asaas (detecta sandbox ou produção automaticamente)
  @Post('test-asaas')
  async testAsaas(@Body('asaasApiKey') asaasApiKey: string) {
    if (!asaasApiKey) {
      throw new BadRequestException('API Key não informada');
    }

    // ✅ Detectar ambiente pela chave
    // Chaves sandbox começam com $aact_hmlg_ ou $aact_YTU5...
    const isSandbox = asaasApiKey.includes('hmlg') || asaasApiKey.includes('sandbox');
    const baseUrl = isSandbox 
      ? 'https://api-sandbox.asaas.com/v3' 
      : 'https://api.asaas.com/v3';

    try {
      const response = await axios.get(`${baseUrl}/customers`, {
        headers: { 
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        params: { limit: 1 },
        timeout: 10000,
      });
      
      return { 
        success: true, 
        message: `Conexão OK (${isSandbox ? 'Sandbox' : 'Produção'})`,
        ambiente: isSandbox ? 'SANDBOX' : 'PRODUCAO',
      };
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.errors?.[0]?.description 
        || error.message 
        || 'Erro desconhecido';
      
      throw new BadRequestException(
        `Falha ao conectar (${status || 'sem resposta'}): ${message}`
      );
    }
  }
}
