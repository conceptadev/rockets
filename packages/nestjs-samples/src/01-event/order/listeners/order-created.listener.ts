import { EventListenerOn } from '@rockts-org/nestjs-event';
import {
  OrderCreatedEvent,
  OrderCreatedEventAsync,
  OrderCreatedEventValues,
} from '../events/order-created.event';

// example listener class
export class OrderCreatedListener extends EventListenerOn<OrderCreatedEvent> {
  // custom handler
  listen(event: OrderCreatedEvent): void {
    const [dto] = event.values;
    dto.name; // no-op;
  }
}

export class OrderCreatedListenerAsync extends EventListenerOn<OrderCreatedEventAsync> {
  // custom handler
  async listen(
    event: OrderCreatedEventAsync,
  ): Promise<OrderCreatedEventValues> {
    return event.values;
  }
}
