import { DynamicModule, Module } from '@nestjs/common';

import {
  LoggerSentryAsyncOptions,
  LoggerSentryModuleClass,
  LoggerSentryOptions,
} from './logger-sentry.module-definition';

/**
 * LoggerSentry Module imports all configuration needed for logger-sentry and sentry
 * With classes for request interceptor and Exceptions filters
 * where will automatically log for any request or unhandled exceptions.
 *
 * @example
 * ```ts
 * // app.module.ts
 * @Module({
 *   imports: [
 *     LoggerSentryModule.forRoot({logLevel: ['log', 'error']})
 *   ]
 * })
 * export class AppModule {}
 *
 * // main.ts
 * async function bootstrap() {
 *   // create the app
 *   const app = await NestFactory.create(AppModule);
 *
 *   // custom logger-sentry
 *   const customLoggerSentryService = app.get(LoggerSentryService);
 *   customLoggerSentryService.addTransport(app.get(LoggerSentrySentryTransport));
 *
 *   // inform app of the custom logger-sentry
 *   app.useLoggerSentry(customLoggerSentryService);
 * }
 *
 * // test.class.ts
 * @Injectable()
 * class TestClass {
 *   // Inject LoggerSentry Service
 *   constructor(@Inject(LoggerSentryService) private loggerService: LoggerSentryService) {}
 *
 *   doSomething() {
 *     this.loggerService.log('Did something');
 *   }
 * }
 *
 * // my.util.ts
 * function myHelper() {
 *   const logger-sentry = new LoggerSentry(); // <-- using the global logger-sentry
 *   logger-sentry.log('My helper ran'); // <-- LoggerSentryService.log will be called
 * }
 * ```
 */
@Module({})
export class LoggerSentryModule extends LoggerSentryModuleClass {
  static register(options: LoggerSentryOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: LoggerSentryAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: LoggerSentryOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: LoggerSentryAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
