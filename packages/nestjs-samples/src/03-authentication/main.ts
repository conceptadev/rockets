import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from '@rockts-org/nestjs-common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(3000);
}
bootstrap();
