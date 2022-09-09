import { Module } from '@nestjs/common';
import { LoggerModule } from '@concepta/nestjs-logger';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [LoggerModule.forRoot({})],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
