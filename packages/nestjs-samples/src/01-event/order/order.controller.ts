import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@ApiTags('orders')
export class OrderController {
  constructor(private ordersService: OrderService) {}

  @Post('/sync')
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('/async')
  async createAsync(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createAsync(createOrderDto);
  }
}
