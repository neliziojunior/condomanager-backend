import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportParserService } from './report-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportController],
  providers: [ReportService, ReportParserService],
  exports: [ReportService, ReportParserService],
})
export class ReportModule {}
