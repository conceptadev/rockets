import { LogLevel, Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';
import { LoggerSentryModule } from '../logger-sentry.module';
import { LoggerModule } from '@concepta/nestjs-logger';
import { LoggerSentryTransport } from '../transports/logger-sentry.transport';
import { Severity } from '@sentry/node';

@Module({
  controllers: [AppControllerFixture],
  imports: [
    LoggerSentryModule.forRoot({
      settings: {
        logLevel: ['warn'],
        transportConfig: {
          dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
          logLevelMap: (_logLevel: LogLevel): Severity => {
            return Severity.Error;
          },
        },
      },
    }),
    LoggerModule.forRootAsync({
      inject: [LoggerSentryTransport],
      useFactory: (loggerSentryTransport: LoggerSentryTransport) => {
        return {
          transports: [loggerSentryTransport],
        };
      },
    }),
  ],
})
export class AppWarnModuleFixture {}
