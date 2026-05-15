import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(
    private noticeService: NoticeService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getNotifications(@Req() req) {
    const condominiumId = req.user.condominiumId;

    const [pendingPackages, openMaintenance, overdueExpenses] = await Promise.all([
      this.prisma.package.count({ where: { condominiumId, status: 'PENDING' } }),
      this.prisma.maintenanceRequest.count({ where: { unit: { condominiumId }, status: 'OPEN' } }),
      this.prisma.expense.count({ where: { condominiumId, status: 'PENDING', dueDate: { lt: new Date() } } }),
    ]);

    return {
      packages: pendingPackages,
      maintenance: openMaintenance,
      overdueExpenses,
      total: pendingPackages + openMaintenance + overdueExpenses,
    };
  }
}
