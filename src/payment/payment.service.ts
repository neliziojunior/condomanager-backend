import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private asaasUrl = 'https://sandbox.asaas.com/api/v3';
  private apiKey = process.env.ASAAS_API_KEY || '';

  constructor(private prisma: PrismaService) {}

  async createCharge(condominiumId: string, data: {
    unitId: string; description: string; amount: number; dueDate: string;
    type?: 'PIX' | 'BOLETO';
  }) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: data.unitId },
      include: { residents: { take: 1, select: { name: true, email: true } } },
    });

    const resident = unit?.residents[0];

    const payment = await axios.post(`${this.asaasUrl}/payments`, {
      customer: resident?.email || 'sindico@condopro.com',
      billingType: data.type || 'PIX',
      value: data.amount,
      dueDate: data.dueDate,
      description: `Unidade ${unit?.number} - ${data.description}`,
      externalReference: data.unitId,
    }, {
      headers: { 'access_token': this.apiKey },
    });

    return {
      id: payment.data.id,
      invoiceUrl: payment.data.invoiceUrl,
      bankSlipUrl: payment.data.bankSlipUrl,
      pixQrCodeUrl: payment.data.pixQrCodeUrl,
      pixCopiaCola: payment.data.pixCopiaCola,
      value: payment.data.value,
      status: payment.data.status,
    };
  }

  async getPaymentStatus(paymentId: string) {
    const { data } = await axios.get(`${this.asaasUrl}/payments/${paymentId}`, {
      headers: { 'access_token': this.apiKey },
    });
    return {
      id: data.id,
      status: data.status,
      value: data.value,
      invoiceUrl: data.invoiceUrl,
      pixQrCodeUrl: data.pixQrCodeUrl,
    };
  }
}
