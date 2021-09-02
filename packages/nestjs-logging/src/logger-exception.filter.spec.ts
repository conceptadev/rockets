import { mock } from 'jest-mock-extended';

import { ArgumentsHost, HttpServer } from '@nestjs/common';

import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerService } from './logger.service';

describe('LoggerExceptionFilter', () => {
  let httpServer : HttpServer;
  let loggerService : LoggerService;
  let argumentsHost : ArgumentsHost;
  let loggerExceptionFilter: LoggerExceptionFilter;
  let spyLoggerServiceException: any;
  
  beforeEach(async () => {
    httpServer = mock<HttpServer>();
    loggerService = mock<LoggerService>();
    argumentsHost = mock<ArgumentsHost>();
    spyLoggerServiceException = jest.spyOn(loggerService, 'exception');
  });

  describe('IsDefined', () => {
    it('was LoggerExceptionFilter defined', async () => {
      expect(httpServer).toBeDefined();
      expect(loggerService).toBeDefined();
      expect(argumentsHost).toBeDefined();
    });
  });

  it('LoggerExceptionFilter.catch', async () => {
    loggerExceptionFilter = new LoggerExceptionFilter(loggerService, httpServer);
    loggerExceptionFilter.catch(new Error() , argumentsHost);
    
    expect(loggerExceptionFilter).toBeDefined();
    expect(spyLoggerServiceException).toBeCalledTimes(1);
  });
  
});
