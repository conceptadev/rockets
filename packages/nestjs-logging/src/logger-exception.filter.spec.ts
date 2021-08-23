import { Test } from '@nestjs/testing';

import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerService } from './logger.service';

describe('LoggerExceptionFilter', () => {
  let loggerExceptionFilter: LoggerExceptionFilter;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerExceptionFilter,
        {
          provide: LoggerService,
          useValue: {},
        }
      ],
    }).compile();
    
    loggerExceptionFilter = moduleRef.get<LoggerExceptionFilter>(LoggerExceptionFilter);
  });

  describe('IsDefined', () => {
    it('was LoggerExceptionFilter defined', async () => {
      expect(loggerExceptionFilter).toBeDefined();
    });
  });
});
