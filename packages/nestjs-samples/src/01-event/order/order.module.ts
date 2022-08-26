import { Module } from '@nestjs/common';
import { EventModule } from '@concepta/nestjs-event';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [EventModule.forRoot({})],
  controllers: [OrderController],
  providers: [OrderController, OrderService],
  exports: [OrderController, OrderService],
})
export class OrderModule {}
