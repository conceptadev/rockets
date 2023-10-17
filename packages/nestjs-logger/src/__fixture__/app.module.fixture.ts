import { Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';
import { LoggerModule } from '../logger.module';

@Module({
  controllers: [AppControllerFixture],
  imports: [LoggerModule.register({})],
})
export class AppModuleFixture {}
