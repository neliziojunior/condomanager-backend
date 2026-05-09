import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: '🚀 CondoManager API está rodando!',
      version: '1.0.0',
      docs: '/auth/register | /auth/login | /expenses',
    };
  }
}