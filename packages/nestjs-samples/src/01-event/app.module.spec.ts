import { Test, TestingModule } from '@nestjs/testing';
import { EventDispatchService } from '@rockts-org/nestjs-event';
import { AppModule } from './app.module';
import {
  OrderCreatedListener,
  OrderCreatedListenerAsync,
} from './order/listeners/order-created.listener';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

describe('AppModule', () => {
  let app: TestingModule;
  let ordersController: OrderController;
  let ordersService: OrderService;
  let eventDispatchService: EventDispatchService;
  let spySync: jest.SpyInstance;
  let spyAsync: jest.SpyInstance;

  beforeEach(async () => {
    spySync = jest.spyOn(OrderCreatedListener.prototype, 'listen');
    spyAsync = jest.spyOn(OrderCreatedListenerAsync.prototype, 'listen');

    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    ordersController = app.get<OrderController>(OrderController);
    ordersService = app.get<OrderService>(OrderService);
    eventDispatchService = app.get<EventDispatchService>(EventDispatchService);

    ordersService.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
    eventDispatchService['eventEmitter'].removeAllListeners();
  });

  describe('listening', () => {
    it('Check Order Created Event SYNC', () => {
      ordersController.create({
        name: 'Order 1',
        description: 'My First Order',
      });

      expect(spySync).toHaveBeenCalledTimes(1);
    });

    it('Check Order Created Event ASYNC', async () => {
      await ordersController.createAsync({
        name: 'Order 2',
        description: 'Order Async',
      });

      expect(spyAsync).toHaveBeenCalledTimes(1);
    });
  });
});
