import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  create(@Body() data: { unitId: string; description: string; amount: number; dueDate: string; type?: 'PIX' | 'BOLETO' }) {
    return this.paymentService.createCharge('', data);
  }

  @Get(':id')
  getStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }
}
