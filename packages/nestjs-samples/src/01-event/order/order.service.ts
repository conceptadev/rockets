import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderCreatedEvent,
  OrderCreatedEventAsync,
} from './events/order-created.event';
import { OnModuleInit } from '@nestjs/common';
import {
  OrderCreatedListener,
  OrderCreatedListenerAsync,
} from './listeners/order-created.listener';

@Injectable()
export class OrderService implements OnModuleInit {
  public orders: Order[] = [
    {
      id: 1,
      name: 'Order #1',
      description: 'Description order #1',
    },
    {
      id: 2,
      name: 'Order #2',
      description: 'Description order #2',
    },
  ];

  onModuleInit() {
    // register a sync listener
    const listener = new OrderCreatedListener();
    listener.on(OrderCreatedEvent);

    // register an async listener
    const listenerAsync = new OrderCreatedListenerAsync();
    listenerAsync.on(OrderCreatedEventAsync);
  }

  async create(createOrderDto: CreateOrderDto) {
    const order = {
      id: this.orders.length + 1,
      ...createOrderDto,
    };
    this.orders.push(order);

    // Create the Event
    const orderEvent = new OrderCreatedEvent(order);

    // dispatch the event
    orderEvent.emit();

    return order;
  }

  async createAsync(createOrderDto: CreateOrderDto) {
    const order = {
      id: this.orders.length + 1,
      ...createOrderDto,
    };
    this.orders.push(order);

    // Create the Event
    const orderEventAsync = new OrderCreatedEventAsync(order);

    // dispatch the event
    await orderEventAsync.emit();

    return order;
  }
}
