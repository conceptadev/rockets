import { Test } from '@nestjs/testing';

import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerService } from './logger.service';

describe('LoggerRequestInterceptor', () => {
  let loggerRequestInterceptor: LoggerRequestInterceptor<any>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerRequestInterceptor,
        {
          provide: LoggerService,
          useValue: {},
        }
      ],
    }).compile();
    
    loggerRequestInterceptor = moduleRef.get<LoggerRequestInterceptor<any>>(LoggerRequestInterceptor);
  });

  describe('IsDefined', () => {
    it('was LoggerTransportService defined', async () => {
      expect(loggerRequestInterceptor).toBeDefined();
    });
  });
});
