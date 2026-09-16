import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ChargeService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: {
    unitId: string;
    description: string;
    amount: number;
    dueDate: string;
    type: 'PIX' | 'BOLETO';
  }) {
    const condominium = await this.prisma.condominium.findUnique({
      where: { id: condominiumId },
    });

    if (!condominium) throw new NotFoundException('Condomínio não encontrado');
    if (!condominium.paymentApiKey) {
      throw new BadRequestException('Configure a API Key de pagamento primeiro');
    }

    const unit = await this.prisma.unit.findUnique({
      where: { id: data.unitId },
      include: { residents: { take: 1 } },
    });

    if (!unit) throw new NotFoundException('Unidade não encontrada');

    const resident = unit.residents[0];
    const isSandbox = condominium.paymentApiKey.includes('hmlg');
    const baseUrl = isSandbox
      ? 'https://api-sandbox.asaas.com/v3'
      : 'https://api.asaas.com/v3';

    try {
      let customerId = resident?.asaasCustomerId;

      if (!customerId && resident) {
        const customerResponse = await axios.post(
          `${baseUrl}/customers`,
          {
            name: resident.name,
            email: resident.email,
            phone: resident.phone,
            externalReference: resident.id,
          },
          {
            headers: { access_token: condominium.paymentApiKey },
          },
        );

        customerId = customerResponse.data.id;

        await this.prisma.person.update({
          where: { id: resident.id },
          data: { asaasCustomerId: customerId },
        });
      }

      const chargeResponse = await axios.post(
        `${baseUrl}/payments`,
        {
          customer: customerId,
          billingType: data.type,
          value: data.amount,
          dueDate: data.dueDate,
          description: data.description,
          externalReference: `${condominiumId}|${data.unitId}`,
        },
        {
          headers: { access_token: condominium.paymentApiKey },
        },
      );

      const charge = chargeResponse.data;

      let pixData = null;
      if (data.type === 'PIX') {
        const pixResponse = await axios.get(
          `${baseUrl}/payments/${charge.id}/pixQrCode`,
          {
            headers: { access_token: condominium.paymentApiKey },
          },
        );
        pixData = pixResponse.data;
      }

      const savedCharge = await this.prisma.payment.create({
        data: {
          condominiumId,
          unitId: data.unitId,
          description: data.description,
          amount: data.amount,
          dueDate: new Date(data.dueDate),
          type: data.type,
          asaasId: charge.id,
          status: charge.status,
          invoiceUrl: charge.invoiceUrl,
          bankSlipUrl: charge.bankSlipUrl,
          pixQrCode: pixData?.encodedImage,
          pixCopiaCola: pixData?.payload,
        },
      });

      return {
        success: true,
        charge: savedCharge,
        asaas: {
          id: charge.id,
          invoiceUrl: charge.invoiceUrl,
          bankSlipUrl: charge.bankSlipUrl,
          pixQrCode: pixData?.encodedImage,
          pixCopiaCola: pixData?.payload,
          status: charge.status,
        },
      };
    } catch (error: any) {
      console.error('Erro Asaas:', error.response?.data || error.message);
      throw new BadRequestException(
        `Erro ao gerar cobrança: ${error.response?.data?.errors?.[0]?.description || error.message}`
      );
    }
  }

  async findAll(condominiumId: string) {
    return this.prisma.payment.findMany({
      where: { condominiumId },
      include: {
        unit: { select: { number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { unit: { select: { number: true } } },
    });
  }
}
