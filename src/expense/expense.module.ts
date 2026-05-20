import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseOcrController } from './expense-ocr.controller'; // ✅ NOVO
import { PrismaModule } from '../prisma/prisma.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [PrismaModule, OpenaiModule],
  controllers: [ExpenseController, ExpenseOcrController], // ✅ NOVO
  providers: [ExpenseService],
})
export class ExpenseModule {}
