import { Module } from '@nestjs/common';
import { LoggerModule } from '@concepta/nestjs-logger';
import { OrderModule } from './order/order.module';

@Module({
  imports: [LoggerModule.forRoot({}), OrderModule],
})
export class AppModule {}
