import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportService } from './report.service';
import { UploadReportDto } from './dto/upload-report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  /**
   * POST /reports/upload
   * Upload de PDF + processamento
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/reports',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `report-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Apenas PDF é permitido'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadReportDto,
    @Req() req,
  ) {
    return this.reportService.uploadAndProcess(
      file,
      dto,
      req.user.condominiumId,
    );
  }

  /**
   * GET /reports
   * Lista relatórios do condomínio
   */
  @Get()
  findAll(@Req() req) {
    return this.reportService.findAll(req.user.condominiumId);
  }

  /**
   * GET /reports/:id
   * Busca 1 relatório
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.reportService.findOne(id, req.user.condominiumId);
  }

  /**
   * POST /reports/:id/approve
   */
  @Post(':id/approve')
  approve(@Param('id') id: string, @Req() req) {
    return this.reportService.approve(id, req.user.condominiumId);
  }

  /**
   * DELETE /reports/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.reportService.delete(id, req.user.condominiumId);
  }
}
