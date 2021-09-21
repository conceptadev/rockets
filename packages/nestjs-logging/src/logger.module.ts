import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from '@nestjs/common';
import {ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { loggerConfig, loggerConfigMerge } from './config/logger.config';
import { LoggerConfigInterface } from './interfaces/logger-config.interface';
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


export interface LoggerConfigOptions {
  loggerConfig: LoggerConfigInterface
}

export interface LoggerConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<LoggerConfigOptions | Promise<LoggerConfigOptions>>,
      'useFactory' | 'inject'
    > {}


@Module({
  imports: [
    //ConfigModule.forFeature(loggerConfig),
    //ConfigModule.forFeature(loggerSentryConfig),
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
  exports: [LoggerService],
 }
)
export class LoggerModule {

   public static forRoot(options?: LoggerConfigOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        ConfigModule.forFeature((() => { return loggerConfigMerge(options?.loggerConfig) })())
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
      exports: [LoggerService],
    };
  }

  public static forRootAsync(options: LoggerConfigAsyncOptions): DynamicModule {

    return {
      module: LoggerModule,
      imports: [{
          module: LoggerModule,
          imports: [LoggerConfigModule.forRootAsync(options)],
          providers: [{
              inject: ['ASYNC_CONFIG'],
              provide: loggerConfig.KEY,
              useFactory: async (config: LoggerConfigOptions) => {
                const finalConfig = loggerConfigMerge(config.loggerConfig);
                return finalConfig();
              }
            }],
          exports: [loggerConfig.KEY]
        }
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
      exports: [LoggerService],
      
    };
  }
}


class LoggerConfigModule {

 public static forRootAsync(options: LoggerConfigAsyncOptions): DynamicModule {
   return {
     module: LoggerConfigModule,
     providers: [
       {
         provide: 'ASYNC_CONFIG',
         inject: options.inject,
         useFactory: options.useFactory,
       },
      ],
     exports: ['ASYNC_CONFIG'],
   };
 }
}
