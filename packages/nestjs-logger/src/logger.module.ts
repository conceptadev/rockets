import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import {
  loggerConfig,
  LOGGER_MODULE_OPTIONS_TOKEN,
} from './config/logger.config';

import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';
import { LoggerService } from './logger.service';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerOptionsInterface } from './interfaces/logger-options.interface';
import { LoggerAsyncOptionsInterface } from './interfaces/logger-async-options.interface';

/**
 * Logger Module imports all configuration needed for logger and sentry
 * With classes for request interceptor and Exceptions filters
 * where will automatically log for any request or unhandled exceptions.
 *
 * ### Example
 * ```ts
 * // app.module.ts
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot({logLevel: ['log', 'error']})
 *   ]
 * })
 * export class AppModule {}
 *
 * // main.ts
 * async function bootstrap() {
 *   // create the app
 *   const app = await NestFactory.create(AppModule);
 *
 *   // custom logger
 *   const customLoggerService = app.get(LoggerService);
 *   customLoggerService.addTransport(app.get(LoggerSentryTransport));
 *
 *   // inform app of the custom logger
 *   app.useLogger(customLoggerService);
 * }
 *
 * // test.class.ts
 * @Injectable()
 * class TestClass {
 *   // Inject Logger Service
 *   constructor(@Inject(LoggerService) private loggerService: LoggerService) {}
 *
 *   doSomething() {
 *     this.loggerService.log('Did something');
 *   }
 * }
 *
 * // my.util.ts
 * function myHelper() {
 *   const logger = new Logger(); // <-- using the global logger
 *   logger.log('My helper ran'); // <-- LoggerService.log will be called
 * }
 * ```
 */
@Module({
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
  exports: [LoggerService],
})
export class LoggerModule {
  public static forRoot(options?: LoggerOptionsInterface): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS_TOKEN,
          useValue: options ?? loggerConfig(),
        },
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
      exports: [LoggerSentryTransport, LoggerService],
    };
  }

  public static forRootAsync(
    options: LoggerAsyncOptionsInterface,
  ): DynamicModule {
    return {
      module: LoggerModule,
      imports: options.imports,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS_TOKEN,
          inject: options.inject,
          useFactory: options.useFactory,
        },
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
      exports: [LoggerService],
    };
  }
}
