import { Module } from '@nestjs/common';
import { CondoAIService } from './condoai.service';
import { CondoAIController } from './condoai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CondoAIController],
  providers: [CondoAIService],
})
export class CondoAIModule {}
