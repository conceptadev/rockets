import { LogLevel, Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';
import { LoggerSentryModule } from '../logger-sentry.module';
import { Severity } from '@sentry/node';
@Module({
  controllers: [AppControllerFixture],
  imports: [LoggerSentryModule.register({
    settings: {
      transportConfig: { 
        dsn: '',
        logLevelMap: (logLevel: LogLevel): Severity => {
          return Severity.Error;
        }
      }
    }
  })],
})
export class AppModuleFixture {}
