import { LogLevel, Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';
import { LoggerCoralogixModule } from '../logger-coralogix.module';
import { Severity } from "coralogix-logger";
@Module({
  controllers: [AppControllerFixture],
  imports: [LoggerCoralogixModule.register({
    settings: {
      logLevel: ['error'],
      transportConfig: {
        privateKey: 'private',
        category: 'logging',
        logLevelMap: (logLevel: LogLevel): Severity => {
          return Severity.info;
        }
      }
    }
  })],
})
export class AppModuleFixture {}
