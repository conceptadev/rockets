import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import {
  LoggerSentryTransport,
  LoggerService,
} from '@rockts-org/nestjs-logger';
import { OrderController } from './order/order.controller';
import { LoggerSentryConfigInterface } from '@rockts-org/nestjs-logger/dist/interfaces/logger-sentry-config.interface';

describe('AppModule', () => {
  let orderController: OrderController;
  let logService: jest.SpyInstance;

  beforeEach(async () => {
    
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    orderController = app.get<OrderController>(OrderController);

    // Get reference of LoggerService From LoggerModule
    const customLoggerService = app.get(LoggerService);

    // This is to inform that this logger will new used internally
    // or it will be used once yuo do a new Logger()
    app.useLogger(customLoggerService);

    logService = jest
      .spyOn(customLoggerService, 'log')
      .mockImplementation(() => null);
  });

  describe('Order Controller', () => {
    it('Create order log', () => {
      orderController.create({
        description: 'Description to log',
        name: 'Order 1',
      });
      expect(logService).toBeCalledTimes(1);
    });
  });
});
