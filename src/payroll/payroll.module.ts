import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollController],
})
export class PayrollModule {}
