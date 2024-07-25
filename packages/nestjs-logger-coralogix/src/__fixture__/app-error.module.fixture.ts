import { LogLevel, Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';
import { LoggerCoralogixModule } from '../logger-coralogix.module';
import { Severity } from 'coralogix-logger';
import { LoggerModule } from '@concepta/nestjs-logger';
import { LoggerCoralogixTransport } from '../transports/logger-coralogix.transport';
import { formatMessage } from '../utils';
@Module({
  controllers: [AppControllerFixture],
  imports: [
    LoggerCoralogixModule.forRoot({
      settings: {
        logLevel: ['error'],
        logLevelMap: (_logLevel: LogLevel): Severity => {
          return Severity.info;
        },
        formatMessage: formatMessage,
        transportConfig: {
          privateKey: 'private',
          category: 'logging',
        },
      },
    }),
    LoggerModule.forRootAsync({
      inject: [LoggerCoralogixTransport],
      useFactory: (loggerCoralogixTransport: LoggerCoralogixTransport) => {
        return {
          transports: [loggerCoralogixTransport],
        };
      },
    }),
  ],
})
export class AppErrorModuleFixture {}
