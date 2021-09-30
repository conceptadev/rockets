import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  EventConfigOptionsInterface,
  EventModule,
} from '@rockts-org/nestjs-event';

const eventConfig: EventConfigOptionsInterface = {
  emitter: {},
};
@Module({
  imports: [EventModule.forRoot(eventConfig)],
  controllers: [OrderController],
  providers: [OrderController, OrderService],
  exports: [OrderController, OrderService],
})
export class OrderModule {}
