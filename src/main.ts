import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });
  
  const port = process.env.PORT || 3333;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 CondoPro rodando na porta ${port}`);
}
bootstrap();
