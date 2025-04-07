import { Module } from '@nestjs/common';
import { AppControllerFixture } from './app.controller.fixture';

@Module({
  controllers: [AppControllerFixture],
})
export class AppModuleFixture {}
