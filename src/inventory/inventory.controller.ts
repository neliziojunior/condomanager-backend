import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  create(@Body() data: any, @Req() req) {
    return this.inventoryService.create(req.user.condominiumId, data);
  }

  @Get()
  findAll(@Req() req, @Query('category') category?: string) {
    return this.inventoryService.findAll(req.user.condominiumId, category);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inventoryService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.inventoryService.delete(id);
  }

  @Get('low-stock')
  lowStock(@Req() req) {
    return this.inventoryService.lowStock(req.user.condominiumId);
  }
}
