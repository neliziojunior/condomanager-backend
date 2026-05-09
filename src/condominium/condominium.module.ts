import { Module } from '@nestjs/common';
import { CondominiumService } from './condominium.service';
import { CondominiumController } from './condominium.controller';

@Module({
  providers: [CondominiumService],
  controllers: [CondominiumController]
})
export class CondominiumModule {}
