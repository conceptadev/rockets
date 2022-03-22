import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { LoggerModule } from '@concepta/nestjs-logger';
@Module({
  imports: [LoggerModule.register(), OrderModule],
})
export class AppModule {}
