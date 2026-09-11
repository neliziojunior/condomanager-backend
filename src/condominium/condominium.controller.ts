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

  @Put('payment-config')
  async updatePaymentConfig(
    @Body() data: { provider: string; apiKey: string; walletId: string; enabled: boolean },
    @Req() req,
  ) {
    return this.condominiumService.updatePaymentConfig(req.user.condominiumId, data);
  }

  // ✅ Testar conexão (detecta sandbox automaticamente)
  @Post('test-payment')
  async testPayment(@Body() data: { provider: string; apiKey: string }) {
    const { provider, apiKey } = data;
    
    if (!apiKey) throw new BadRequestException('API Key não informada');

    try {
      if (provider === 'ASAAS') {
        // ✅ Detecta sandbox pelo prefixo $aact_hmlg_
        const isSandbox = apiKey.includes('hmlg') || apiKey.includes('sandbox');
        const baseUrl = isSandbox 
          ? 'https://api-sandbox.asaas.com/v3' 
          : 'https://api.asaas.com/v3';
        
        console.log(`🔍 Testando Asaas em ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}: ${baseUrl}`);
        
        const response = await axios.get(`${baseUrl}/customers`, {
          headers: { 
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
          params: { limit: 1 },
          timeout: 10000,
        });
        
        return { 
          success: true, 
          message: `Conexão OK (${isSandbox ? 'Sandbox' : 'Produção'})`,
          ambiente: isSandbox ? 'SANDBOX' : 'PRODUCAO',
          totalClientes: response.data.totalCount || 0,
        };
      }
      
      if (provider === 'PJBank') {
        return { success: true, message: 'PJBank configurado (validação manual)' };
      }

      return { success: true, message: `Provedor ${provider} configurado` };
    } catch (error: any) {
      console.error('Erro Asaas:', error.response?.data || error.message);
      
      const status = error.response?.status;
      const message = error.response?.data?.errors?.[0]?.description 
        || error.response?.data?.message
        || error.message;
      
      throw new BadRequestException(
        `Falha ao conectar (${status}): ${message}`
      );
    }
  }
}
