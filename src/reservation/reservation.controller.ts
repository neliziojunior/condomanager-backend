import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post('spaces')
  createSpace(@Body() data: { name: string; description?: string; capacity?: number; price?: number }, @Req() req) {
    return this.reservationService.createSpace(req.user.condominiumId, data);
  }

  @Get('spaces')
  getSpaces(@Req() req) {
    return this.reservationService.getSpaces(req.user.condominiumId);
  }

  @Post()
  create(@Body() data: { spaceId: string; unitId: string; date: string; startTime: string; endTime: string; purpose?: string }, @Req() req) {
    return this.reservationService.createReservation({ ...data, personId: req.user.id });
  }

  @Get()
  getReservations(@Req() req, @Query('date') date?: string) {
    return this.reservationService.getReservations(req.user.condominiumId, date);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.reservationService.updateStatus(id, status);
  }
}
