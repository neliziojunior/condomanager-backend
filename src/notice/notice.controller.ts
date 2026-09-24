import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notices')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  @Post()
  create(@Body() data: any, @Req() req) {
    return this.noticeService.create(req.user.condominiumId, req.user.id, data);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('category') category?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.noticeService.findAll(req.user.condominiumId, {
      category,
      activeOnly: activeOnly === 'true',
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.noticeService.update(id, data);
  }

  @Post(':id/view')
  incrementViews(@Param('id') id: string) {
    return this.noticeService.incrementViews(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.noticeService.delete(id);
  }
}
