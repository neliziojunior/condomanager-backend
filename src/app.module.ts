import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CondominiumModule } from './condominium/condominium.module';
import { ExpenseModule } from './expense/expense.module';
import { OpenaiModule } from './openai/openai.module';
import { UnitModule } from './unit/unit.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PackageModule } from './package/package.module';
import { NoticeModule } from './notice/notice.module';
import { ReservationModule } from './reservation/reservation.module';
import { DocumentModule } from './document/document.module';
import { OccurrenceModule } from './occurrence/occurrence.module';
import { LostFoundModule } from './lostfound/lostfound.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { PollModule } from './poll/poll.module';
import { ListingModule } from './listing/listing.module';
import { VisitorModule } from './visitor/visitor.module';
import { ChatModule } from './chat/chat.module';
import { AccountingModule } from './accounting/accounting.module'; // ✅ NOVO: AccountingModule
import { SignatureModule } from './signature/signature.module';
import { InventoryModule } from './inventory/inventory.module';
import { AssemblyModule } from './assembly/assembly.module'; // ✅ NOVO: AssemblyModule
import { PaymentModule } from './payment/payment.module';
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
    PackageModule,
    NoticeModule,
    ReservationModule,
    DocumentModule,
    OccurrenceModule,
    LostFoundModule,
    ChatbotModule,
    PollModule,
    ListingModule,
    VisitorModule,
    ChatModule,
    AccountingModule, // ✅ NOVO: AccountingModule
    SignatureModule,
    InventoryModule,
    AssemblyModule,
    PaymentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
