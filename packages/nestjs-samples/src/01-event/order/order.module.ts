import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { EventModule, EventOptionsInterface } from '@concepta/nestjs-event';

const eventConfig: EventOptionsInterface = {
  emitter: {},
};
@Module({
  imports: [EventModule.register(eventConfig)],
  controllers: [OrderController],
  providers: [OrderController, OrderService],
  exports: [OrderController, OrderService],
})
export class OrderModule {}
