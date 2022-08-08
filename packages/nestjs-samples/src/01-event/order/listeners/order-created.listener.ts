import { EventListenerOn } from '@concepta/nestjs-event';
import {
  OrderCreatedEvent,
  OrderCreatedEventAsync,
  OrderCreatedEventInterface,
} from '../events/order-created.event';

// example listener class
export class OrderCreatedListener extends EventListenerOn<OrderCreatedEvent> {
  // custom handler
  listen(event: OrderCreatedEvent): void {
    const dto = event.payload;
    dto.name; // no-op;
  }
}

export class OrderCreatedListenerAsync extends EventListenerOn<OrderCreatedEventAsync> {
  // custom handler
  async listen(
    event: OrderCreatedEventAsync,
  ): Promise<OrderCreatedEventInterface> {
    return event.payload;
  }
}
