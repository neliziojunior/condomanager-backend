import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  create(@Body() data: any, @Req() req) {
    return this.employeeService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req) {
    return this.employeeService.findAll(req.user.condominiumId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.employeeService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.employeeService.delete(id);
  }

  // 🧮 Botão mágico da IA
  @Post(':id/calcular')
  calcular(@Param('id') id: string) {
    return this.employeeService.calcularFolha(id);
  }
}
