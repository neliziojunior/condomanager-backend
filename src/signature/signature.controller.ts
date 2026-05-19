import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('signatures')
@UseGuards(JwtAuthGuard)
export class SignatureController {
  constructor(private signatureService: SignatureService) {}

  @Post()
  sign(@Body() data: { documentId: string; signatureData: string }, @Req() req) {
    return this.signatureService.create(req.user.condominiumId, {
      documentId: data.documentId,
      personId: req.user.id,
      signatureData: data.signatureData,
      ip: req.ip,
    });
  }

  @Get('document/:id')
  getSignatures(@Param('id') id: string) {
    return this.signatureService.getSignatures(id);
  }

  @Get('check/:documentId')
  checkSignature(@Param('documentId') documentId: string, @Req() req) {
    return this.signatureService.hasSigned(documentId, req.user.id);
  }
}
