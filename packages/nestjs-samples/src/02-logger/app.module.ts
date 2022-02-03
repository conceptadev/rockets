import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { LoggerModule } from '@rockts-org/nestjs-logger';
@Module({
  imports: [LoggerModule.register(), OrderModule],
})
export class AppModule {}
