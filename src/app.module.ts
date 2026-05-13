import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CondominiumModule } from './condominium/condominium.module';
import { ExpenseModule } from './expense/expense.module';
import { OpenaiModule } from './openai/openai.module';
import { UnitModule } from './unit/unit.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CondominiumModule,
    ExpenseModule,
    OpenaiModule,
    UnitModule,
    MaintenanceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
