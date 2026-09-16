import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: any) {
    return this.prisma.employee.create({ data: { ...data, condominiumId } });
  }

  async findAll(condominiumId: string) {
    return this.prisma.employee.findMany({ where: { condominiumId }, orderBy: { name: 'asc' } });
  }

  async update(id: string, data: any) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }

  // 🧮 Cálculo completo da folha de pagamento (CLT)
  async calcularFolha(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Funcionário não encontrado');

    const salarioBase = emp.salarioBase || 0;
    const salarioMinimo = 1412.00;

    // ========== PROVENTOS ==========
    const periculosidade = emp.periculosidade || 0;
    const adicionalNoturno = emp.adicionalNoturno || 0;
    const insalubridade = emp.insalubridade || 0;
    
    // Horas Extras
    const valorHora = salarioBase / 220;
    const horasExtras50Valor = (emp.horasExtras50 || 0) * valorHora * 1.5;
    const horasExtras100Valor = (emp.horasExtras100 || 0) * valorHora * 2.0;
    const totalHorasExtras = horasExtras50Valor + horasExtras100Valor;
    
    // DSR sobre horas extras
    const diasUteis = 26;
    const dsr = totalHorasExtras > 0 ? (totalHorasExtras / diasUteis) * 4 : 0;
    
    // Total Proventos
    const totalProventos = salarioBase + periculosidade + adicionalNoturno + 
                           insalubridade + totalHorasExtras + dsr;

    // ========== DESCONTOS (Funcionário) ==========
    
    // INSS (Tabela 2026)
    let inssFuncionario = 0;
    if (totalProventos <= 1412.00) {
      inssFuncionario = totalProventos * 0.075;
    } else if (totalProventos <= 2666.68) {
      inssFuncionario = totalProventos * 0.09;
    } else if (totalProventos <= 4000.03) {
      inssFuncionario = totalProventos * 0.12;
    } else if (totalProventos <= 7786.02) {
      inssFuncionario = totalProventos * 0.14;
    } else {
      inssFuncionario = 7786.02 * 0.14;
    }

    // IRRF (Tabela 2026)
    const baseIRRF = totalProventos - inssFuncionario;
    let irrf = 0;
    if (baseIRRF <= 2259.20) {
      irrf = 0;
    } else if (baseIRRF <= 2826.65) {
      irrf = (baseIRRF * 0.075) - 169.44;
    } else if (baseIRRF <= 3751.05) {
      irrf = (baseIRRF * 0.15) - 381.44;
    } else if (baseIRRF <= 4664.68) {
      irrf = (baseIRRF * 0.225) - 662.77;
    } else {
      irrf = (baseIRRF * 0.275) - 896.00;
    }
    if (irrf < 0) irrf = 0;

    // Outros descontos
    const valeTransporte = emp.valeTransporte || 0;
    const valeRefeicao = emp.valeRefeicao || 0;
    const planoSaude = emp.planoSaude || 0;
    const planoOdonto = emp.planoOdonto || 0;
    const faltas = emp.faltas || 0;
    const pensaoAlimenticia = emp.pensaoAlimenticia || 0;
    const adiantamento = emp.adiantamento || 0;
    
    // Desconto máximo do VT (6% do salário)
    const vtDescontoMaximo = salarioBase * 0.06;
    const vtDesconto = Math.min(valeTransporte, vtDescontoMaximo);

    const totalDescontos = inssFuncionario + irrf + vtDesconto + valeRefeicao + 
                           planoSaude + planoOdonto + faltas + pensaoAlimenticia + adiantamento;

    // ========== ENCARGOS (Empresa) ==========
    const rat = 0.03;
    const terceiros = 0.058;
    const inssEmpresa = totalProventos * (0.20 + rat + terceiros);
    const fgtsEmpresa = totalProventos * 0.08;

    // ========== PROVISÕES MENSAIS ==========
    const provisaoFerias = (salarioBase / 12) * 1.3333;
    const provisao13 = salarioBase / 12;
    const provisaoFgtsFerias = provisaoFerias * 0.08;
    const provisaoFgts13 = provisao13 * 0.08;
    const provisaoInssFerias = provisaoFerias * (0.20 + rat + terceiros);
    const provisaoInss13 = provisao13 * (0.20 + rat + terceiros);

    // ========== TOTAL LÍQUIDO ==========
    const totalLiquido = totalProventos - totalDescontos;
    const custoTotalEmpresa = totalProventos + inssEmpresa + fgtsEmpresa + 
                              provisaoFerias + provisao13 + provisaoFgtsFerias + 
                              provisaoFgts13 + provisaoInssFerias + provisaoInss13;

    return this.prisma.employee.update({
      where: { id },
      data: {
        totalProventos, totalDescontos, totalLiquido,
        inssFuncionario, irrf, inssEmpresa, fgtsEmpresa,
        rat: rat * 100, terceiros: terceiros * 100,
        provisaoFerias, provisao13, provisaoFgtsFerias, provisaoFgts13,
        provisaoInssFerias, provisaoInss13,
        custoTotalEmpresa, dsr,
        competencia: new Date().toISOString().slice(0, 7),
      },
    });
  }
}
