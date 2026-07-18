
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: any) {
    return this.prisma.employee.create({
      data: { ...data, condominiumId },
    });
  }

  async findAll(condominiumId: string) {
    return this.prisma.employee.findMany({
      where: { condominiumId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }

  // 🧮 Calcular folha de pagamento
  async calcularFolha(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Funcionário não encontrado');

    const salarioBase = emp.salarioBase || 0;
    
    // Proventos
    const periculosidade = emp.periculosidade || (salarioBase * 0.30);
    const insalubridade = emp.insalubridade || 0;
    const adicionalNoturno = emp.adicionalNoturno || 0;
    const horasExtras = emp.horasExtras || 0;
    const dsr = emp.dsr || (horasExtras > 0 ? horasExtras / 6 : 0);
    
    const totalProventos = salarioBase + periculosidade + insalubridade + adicionalNoturno + horasExtras + dsr;

    // Encargos
    const fgtsValor = salarioBase * ((emp.fgtsPercentual || 8) / 100);
    const inssValor = salarioBase * ((emp.inssPercentual || 0) / 100);
    
    // Descontos
    const valeTransporte = emp.valeTransporte || 0;
    const valeRefeicao = emp.valeRefeicao || 0;
    const planoSaude = emp.planoSaude || 0;
    const planoOdonto = emp.planoOdonto || 0;
    const faltas = emp.faltas || 0;
    
    const totalDescontos = inssValor + valeTransporte + valeRefeicao + planoSaude + planoOdonto + faltas;
    const totalLiquido = totalProventos - totalDescontos;

    // Provisões
    const feriasProporcional = salarioBase / 12;
    const decimoTerceiro = salarioBase / 12;
    const avisoPrevio = emp.status === 'DEMITIDO' ? salarioBase : 0;
    const multaFgts = emp.status === 'DEMITIDO' ? fgtsValor * 0.40 : 0;

    return this.prisma.employee.update({
      where: { id },
      data: {
        fgtsValor, inssValor,
        totalProventos, totalDescontos, totalLiquido,
        feriasProporcional, decimoTerceiro, avisoPrevio, multaFgts,
        periculosidade, insalubridade, dsr,
      },
    });
  }
}
