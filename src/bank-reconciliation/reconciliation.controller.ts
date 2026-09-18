import { 
  Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, 
  UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bank-reconciliation')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(private reconciliationService: ReconciliationService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/statements',
      filename: (req, file, cb) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, name + extname(file.originalname));
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const fileUrl = `https://condpro.onrender.com/uploads/statements/${file.filename}`;
    return this.reconciliationService.processStatement(
      req.user.condominiumId,
      fileUrl,
      file.originalname,
      file.mimetype,
    );
  }

  @Get()
  findAll(@Req() req) {
    return this.reconciliationService.findAll(req.user.condominiumId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reconciliationService.findById(id);
  }

  @Put('entries/:entryId')
  updateEntry(@Param('entryId') entryId: string, @Body() data: any) {
    return this.reconciliationService.updateEntry(entryId, data);
  }

  @Post(':id/approve-all')
  approveAll(@Param('id') id: string) {
    return this.reconciliationService.approveAll(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reconciliationService.delete(id);
  }
}
