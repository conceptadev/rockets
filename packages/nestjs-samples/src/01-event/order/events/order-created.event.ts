import {
  EventAsync,
  EventAsyncInterface,
  EventSync,
  EventSyncInterface,
} from '@concepta/nestjs-event';

export type OrderCreatedEventInterface = {
  name: string;
  description: string;
};

export class OrderCreatedEvent
  extends EventSync<OrderCreatedEventInterface>
  implements EventSyncInterface<OrderCreatedEventInterface> {}

export class OrderCreatedEventAsync
  extends EventAsync<OrderCreatedEventInterface>
  implements EventAsyncInterface<OrderCreatedEventInterface> {}
