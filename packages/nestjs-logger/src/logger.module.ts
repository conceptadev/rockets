import { APP_FILTER, APP_INTERCEPTOR, BaseExceptionFilter } from '@nestjs/core';
import { Module } from '@nestjs/common';
import {
  loggerConfig,
  LOGGER_MODULE_OPTIONS_TOKEN,
  LOGGER_MODULE_SETTINGS_TOKEN,
} from './config/logger.config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';
import { LoggerService } from './logger.service';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerOptionsInterface } from './interfaces/logger-options.interface';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { LoggerSettingsInterface } from './interfaces/logger-settings.interface';

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
    LoggerTransportService,
    LoggerRequestInterceptor,
    LoggerExceptionFilter,
  ],
  exports: [LoggerService],
})
export class LoggerModule extends createConfigurableDynamicRootModule<
  LoggerModule,
  LoggerOptionsInterface
>(LOGGER_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(loggerConfig)],
  providers: [
    {
      provide: LOGGER_MODULE_SETTINGS_TOKEN,
      inject: [LOGGER_MODULE_OPTIONS_TOKEN, loggerConfig.KEY],
      useFactory: async (
        options: LoggerOptionsInterface,
        defaultSettings: ConfigType<typeof loggerConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      inject: [LOGGER_MODULE_OPTIONS_TOKEN, LoggerExceptionFilter],
      useFactory: async (
        options: LoggerOptionsInterface,
        defaultService: BaseExceptionFilter,
      ) => options.exceptionFilter ?? defaultService,
    },
    {
      provide: LoggerService,
      inject: [
        LOGGER_MODULE_OPTIONS_TOKEN,
        LOGGER_MODULE_SETTINGS_TOKEN,
        LoggerTransportService,
      ],
      useFactory: async (
        options: LoggerOptionsInterface,
        settings: LoggerSettingsInterface,
        loggerTransportService: LoggerTransportService,
      ) => {
        if (settings?.transportSentryConfig) {
          const sentry = new LoggerSentryTransport(
            settings.transportSentryConfig,
          );
          loggerTransportService.addTransport(sentry);
        }

        options?.transports?.forEach((transport) => {
          loggerTransportService.addTransport(transport);
        });

        return new LoggerService(loggerTransportService);
      },
    },
  ],
}) {
  static register(options: LoggerOptionsInterface = {}) {
    return LoggerModule.forRoot(LoggerModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<LoggerOptionsInterface>) {
    return LoggerModule.forRootAsync(LoggerModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<LoggerModule, LoggerOptionsInterface>(
      LoggerModule,
      options,
    );
  }
}
