import { Test } from '@nestjs/testing';

import { loggerConfig } from './config/logger.config';
import { LoggerTransportService } from './logger-transport.service';

describe('LoggerTransportService', () => {
  let loggerTransportService: LoggerTransportService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerTransportService,
        {
          provide: loggerConfig.KEY,
          useValue: { }
        },
      ],
    }).compile();
    
    loggerTransportService = moduleRef.get<LoggerTransportService>(LoggerTransportService);
  });

  describe('IsDefined', () => {
    it('was LoggerTransportService defined', async () => {
      expect(loggerTransportService).toBeDefined();
    });
  });
});
