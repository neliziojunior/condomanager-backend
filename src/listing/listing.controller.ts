import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Post()
  create(@Body() data: { title: string; description: string; price?: number; type?: string }, @Req() req) {
    return this.listingService.create(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  findAll(@Req() req, @Query('type') type?: string) {
    return this.listingService.findAll(req.user.condominiumId, type);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.listingService.deactivate(id);
  }
}
