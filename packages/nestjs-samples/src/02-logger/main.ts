import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@concepta/nestjs-logger';

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get reference of LoggerService From LoggerModule
  const customLoggerService = app.get(LoggerService);

  // This is to inform that this logger will new used internally
  // or it will be used once yuo do a new Logger()
  app.useLogger(customLoggerService);

  await app.listen(3000);
}
bootstrap();
