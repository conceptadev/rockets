import { Test } from '@nestjs/testing';

import { loggerSentryConfig } from '../config/logger-sentry.config';
import { LoggerSentryTransport } from './logger-sentry.transport';

describe('loggerSentryTransport', () => {
  let loggerSentryTransport: LoggerSentryTransport;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerSentryTransport,
        {
          provide: loggerSentryConfig.KEY,
          useValue: {},
        }
      ],
    }).compile();
    
    loggerSentryTransport = moduleRef.get<LoggerSentryTransport>(LoggerSentryTransport);
  });

  describe('IsDefined', () => {
    it('was loggerSentryTransport defined', async () => {
      expect(loggerSentryTransport).toBeDefined();
    });
  });
});
