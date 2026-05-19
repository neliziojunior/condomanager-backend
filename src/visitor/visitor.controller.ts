import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as QRCode from 'qrcode';

@Controller('visitors')
@UseGuards(JwtAuthGuard)
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Post()
  create(@Body() data: { unitId: string; name: string; document?: string; reason?: string }, @Req() req) {
    return this.visitorService.create(req.user.condominiumId, {
      ...data,
      authorizedBy: req.user.id,
    });
  }

  // ✅ NOVO: Gerar QR Code para visitante
  @Post('generate-qr')
  async generateQR(@Body() data: { unitId: string; name: string; document?: string; reason?: string }, @Req() req) {
    const visitor = await this.visitorService.create(req.user.condominiumId, {
      ...data,
      authorizedBy: req.user.id,
    });

    // Dados que vão no QR Code
    const qrData = JSON.stringify({
      id: visitor.id,
      name: visitor.name,
      unit: visitor.unit?.number,
      document: visitor.document,
      createdAt: visitor.entryAt,
    });

    // Gerar QR Code em base64
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#00A896', light: '#FFFFFF' },
    });

    return {
      visitor,
      qrCode: qrCodeImage, // Imagem em base64 para mostrar no frontend
    };
  }

  // ✅ NOVO: Validar QR Code na portaria (escaneou o QR)
  @Post('validate-qr')
  async validateQR(@Body('qrData') qrData: string) {
    try {
      const data = JSON.parse(qrData);
      const visitor = await this.visitorService.findById(data.id);
      
      if (!visitor) {
        return { valid: false, message: 'Visitante não encontrado' };
      }
      
      if (visitor.status === 'INACTIVE') {
        return { valid: false, message: 'QR Code já utilizado ou expirado' };
      }

      return {
        valid: true,
        visitor: {
          id: visitor.id,
          name: visitor.name,
          unit: visitor.unit?.number,
          document: visitor.document,
        },
      };
    } catch (error) {
      return { valid: false, message: 'QR Code inválido' };
    }
  }

  @Get()
  findAll(@Req() req, @Query('status') status?: string) {
    return this.visitorService.findAll(req.user.condominiumId, status);
  }

  @Put(':id/exit')
  registerExit(@Param('id') id: string) {
    return this.visitorService.registerExit(id);
  }

  @Get('active-count')
  activeCount(@Req() req) {
    return this.visitorService.activeCount(req.user.condominiumId);
  }
}
