import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CompanyService {
  async buscarCnpj(cnpj: string) {
    // Limpar CNPJ (remover pontuação)
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      throw new BadRequestException('CNPJ inválido. Deve ter 14 dígitos.');
    }

    try {
      // BrasilAPI - gratuita e sem limite
      const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 10000,
      });

      return {
        cnpj: data.cnpj,
        razaoSocial: data.razao_social,
        nomeFantasia: data.nome_fantasia || data.razao_social,
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.municipio,
          uf: data.uf,
          cep: data.cep,
          enderecoCompleto: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''} - ${data.bairro}, ${data.municipio}/${data.uf} - CEP ${data.cep}`,
        },
        telefone: data.ddd_telefone_1 || null,
        email: data.email || null,
        atividade: data.cnae_fiscal_descricao,
        situacao: data.descricao_situacao_cadastral,
        dataAbertura: data.data_inicio_atividade,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestException('CNPJ não encontrado na Receita Federal');
      }
      throw new BadRequestException('Erro ao consultar CNPJ. Tente novamente.');
    }
  }
}
