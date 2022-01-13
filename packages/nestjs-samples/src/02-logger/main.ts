import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  LoggerSentryTransport,
  LoggerService,
} from '@rockts-org/nestjs-logger';

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //TODO: validate
  //useSentryTransport(app);

  // Get the Transport to be used with new Logger
  const loggerSentryTransport = app.get(LoggerSentryTransport);

  // Get reference of LoggerService From LoggerModule
  const customLoggerService = app.get(LoggerService);

  // Inform that sentry transport will also be used
  //customLoggerService.addTransport(loggerSentryTransport);

  // This is to inform that this logger will new used internally
  // or it will be used once yuo do a new Logger()
  app.useLogger(customLoggerService);

  await app.listen(3000);
}
bootstrap();
