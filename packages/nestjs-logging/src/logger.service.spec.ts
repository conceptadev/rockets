import { Test } from '@nestjs/testing';

import { LoggerTransportService } from './logger-transport.service';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: LoggerTransportService, useValue: {
            addTransport: jest.fn(),
            log: jest.fn()
          }
        },
      ],
    }).compile();
    
    loggerService = moduleRef.get<LoggerService>(LoggerService);
  });

  describe('IsDefined', () => {
    it('LoggerService', async () => {
      expect(loggerService).toBeDefined();
    });
  });
});
