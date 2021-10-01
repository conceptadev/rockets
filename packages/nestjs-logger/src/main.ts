import { INestApplication } from "@nestjs/common";
import { LoggerService } from ".";
import { LoggerSentryTransport } from "./transports/logger-sentry.transport";

export const useSentryTransport = (app: INestApplication) => {

    // Get the Transport to be used with new Logger 
  const loggerSentryTransport = app.get(LoggerSentryTransport);

  // Get reference of LoggerService From LoggerModule
  const customLoggerService = app.get(LoggerService);

  // Inform that sentry transport will also be used
  customLoggerService.addTransport(loggerSentryTransport);

  // This is to inform that this logger will new used internally
  // or it will be used once yuo do a new Logger()
  app.useLogger(customLoggerService);
        
}