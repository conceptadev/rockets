import {
  EventAsync,
  EventAsyncInterface,
  EventSync,
  EventSyncInterface,
} from '@concepta/nestjs-event';

export type OrderCreatedEventDto = {
  name: string;
  description: string;
};

export type OrderCreatedEventValues = [OrderCreatedEventDto];

export class OrderCreatedEvent
  extends EventSync<OrderCreatedEventValues>
  implements EventSyncInterface<OrderCreatedEventValues> {}

export class OrderCreatedEventAsync
  extends EventAsync<OrderCreatedEventValues>
  implements EventAsyncInterface<OrderCreatedEventValues> {}
