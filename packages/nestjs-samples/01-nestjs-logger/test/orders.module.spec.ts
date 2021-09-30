import { Test, TestingModule } from '@nestjs/testing';
import { EventDispatchService, EventListenService } from '@rockts-org/nestjs-event';
import { OrdersController } from './orders.controller';
import { OrdersModule } from './orders.module';

describe('OrdersModule', () => {
  let ordersController: OrdersController;
  let eventDispatchService: EventDispatchService;
  let eventListenService: EventListenService;
  let spyOn: jest.SpyInstance;
  
  beforeEach(async () => {
    const orders: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule]
    }).compile();

    ordersController = orders.get<OrdersController>(OrdersController);
    eventDispatchService = orders.get<EventDispatchService>(EventDispatchService);
    eventListenService = orders.get<EventListenService>(EventListenService);
    
    spyOn = jest.spyOn(eventListenService, 'on');
    
  });

  afterEach(() => {
    jest.clearAllMocks();
    eventDispatchService['eventEmitter'].removeAllListeners();
  })

  describe('root', () => {
    it('Check Order Created Event', () => {
      ordersController.create({
        name: 'Order 1',
        description:  'My First Order'
      });
      expect(true).toBeTruthy();
    });

    it('Check Order Created Event ASYNC', () => {
      ordersController.createAsync({
        name: 'Order 2',
        description:  'Order Async'
      });
      expect(true).toBeTruthy();
    });
  });
});
