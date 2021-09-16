import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { loggerSentryConfig } from './config/logger-sentry.config';
import { loggerConfig } from './config/logger.config';
import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerService } from './logger.service';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';

/**
 * Logger Module Imports all configuration needed for logger and sentry
 * With classes for request interceptor and Exceptions filters
 * where will automatically log for any request or unhandled exceptions.
 * 
 * To start using the loggerService all you need to do is inject it on controller
 * ```ts
 * class TestLogger {
 *      // Inject Logger Service
 *      constructor(@Inject(LoggerService) private loggerService: LoggerService) { }
 *  }
 * ```
 * 
 * or create a new instance of Logger
 * 
 * ```ts
 *      // If you call Logger.log the LoggerService.log will be called
 *      testLoggerLog():void {
 *          const logger = new Logger();
 *          logger.log('Message from testLoggerLog');
 *      }
 * ```
 * 
 * 
 * ### Example
 * ```ts
 * @Module({
 *   imports: [
 *     LoggerModule
 *   ] 
 * })
 * 
 * ...
 * 
 * // This is to inform that this logger will new used internally
 * // or it will be used when you create a new instance using new Logger()
 * app.useLogger(customLoggerService);
 * 
 * ...
 * 
 * // To start using loggerService all you need is to inject the loggerService 
 * // or initialize a new Logger
 * class TestLogger {
 *      
 *      // Inject Logger Service
 *      constructor(@Inject(LoggerService) private loggerService: LoggerService) { }
 *
 *      // Call any method even custom method
 *      testLoggerServiceLog():void {
 *          this.loggerService.log('Message from testLoggerServiceLog');
 *       }
 *
 *      // If you call Logger.log the LoggerService.log will be called
 *      testLoggerLog():void {
 *          const logger = new Logger();
 *          logger.log('Message from testLoggerLog');
 *      }
 *  }
 *```
 */
@Module({
  imports: [
    ConfigModule.forFeature(loggerConfig),
    ConfigModule.forFeature(loggerSentryConfig),
  ],
  providers: [
    LoggerService,
    LoggerTransportService,
    LoggerSentryTransport,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggerExceptionFilter,
    },
  ],
  exports: [
    LoggerService
  ]
})
export class LoggerModule {}
