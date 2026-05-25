import { Module } from '@nestjs/common';
import { CondoScoreService } from './condoscore.service';
import { CondoScoreController } from './condoscore.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CondoScoreController],
  providers: [CondoScoreService],
})
export class CondoScoreModule {}
