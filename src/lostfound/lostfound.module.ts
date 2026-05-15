import { Module } from '@nestjs/common';
import { LostFoundService } from './lostfound.service';
import { LostFoundController } from './lostfound.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LostFoundController],
  providers: [LostFoundService],
})
export class LostFoundModule {}
