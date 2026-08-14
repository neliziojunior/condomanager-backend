import { Injectable } from '@nestjs/common';

@Injectable()
export class FiscalObligationsService {
  getObrigacoes(ano: number, mes: number) {
    const hoje = new Date();
    const anoAtual = ano || hoje.getFullYear();
    const mesAtual = mes || hoje.getMonth() + 1;

    const obrigacoes = [
      { nome: 'GPS (INSS Empregados)', vencimento: 20, tipo: 'GPS' },
      { nome: 'FGTS (GFIP)', vencimento: 7, tipo: 'FGTS' },
      { nome: 'DAS (Simples Nacional)', vencimento: 20, tipo: 'DAS' },
      { nome: 'DARF (IRRF)', vencimento: 20, tipo: 'DARF' },
      { nome: 'eSocial (Eventos)', vencimento: 15, tipo: 'eSocial' },
      { nome: 'DCTFWeb', vencimento: 15, tipo: 'DCTFWeb' },
    ];

    return obrigacoes.map(obr => {
      const dataVencimento = new Date(anoAtual, mesAtual - 1, obr.vencimento);
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...obr,
        dataVencimento: dataVencimento.toISOString(),
        diasRestantes,
        status: diasRestantes < 0 ? 'VENCIDA' : diasRestantes < 5 ? 'URGENTE' : diasRestantes < 10 ? 'ATENCAO' : 'EM_DIA',
      };
    });
  }
}
