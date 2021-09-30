import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Inject } from '@nestjs/common';
import { LoggerService } from '@rockts-org/nestjs-logger';

@Injectable()
export class OrdersService {
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

  constructor(@Inject(LoggerService) private loggerService: LoggerService) {

  }

  create(createOrderDto: CreateOrderDto) {
    const order = {
      id: this.orders.length + 1,
      ...createOrderDto,
    };
    this.orders.push(order);

    this.loggerService.log('A order was just created.').
    
    return order;
  }
}
