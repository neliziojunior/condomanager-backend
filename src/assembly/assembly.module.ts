import { Module } from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { AssemblyController } from './assembly.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssemblyController],
  providers: [AssemblyService],
})
export class AssemblyModule {}
