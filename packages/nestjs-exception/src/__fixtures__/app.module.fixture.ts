import { Module } from '@nestjs/common';
import { AppController } from './app.controller.fixture';

@Module({
  controllers: [AppController],
})
export class AppModule {}
