import { ConsoleLogger, ForbiddenException, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoggerTransportInterface } from './interfaces/logger-transport.interface';


import { LoggerTransportService } from './logger-transport.service';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let loggerTransportService: LoggerTransportService;
  let spyAddTransport: jest.SpyInstance;
  let spyTransportLog: jest.SpyInstance;
  let spyDebug: jest.SpyInstance;
  let spyError: jest.SpyInstance;
  let spyLog: jest.SpyInstance;
  let spyVerbose: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let errorMessage: string;
  let context: string;

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
    loggerTransportService = moduleRef.get<LoggerTransportService>(LoggerTransportService);
    
    spyAddTransport = jest.spyOn(loggerTransportService, 'addTransport');
    spyTransportLog = jest.spyOn(loggerTransportService, 'log');
    
    spyDebug = jest.spyOn(ConsoleLogger.prototype, 'debug');
    spyError = jest.spyOn(ConsoleLogger.prototype, 'error');
    spyVerbose = jest.spyOn(ConsoleLogger.prototype, 'verbose');
    spyWarn = jest.spyOn(ConsoleLogger.prototype, 'warn');
    spyLog = jest.spyOn(ConsoleLogger.prototype, 'log');
    
    context = "jest";
    errorMessage = "Error Message";


  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('IsDefined', () => {
    it('LoggerService', async () => {
      expect(loggerService).toBeDefined();
    });
  });

  describe('Methods', () => {
    
    it('loggerService.addTransport', async () => {
      await loggerService.addTransport({} as LoggerTransportInterface);
      expect(spyAddTransport).toBeCalledTimes(1);
    });

    /**
     *
     * Check if debug method was called 
     *
     */
    it('loggerService.exception_debug', async () => {
      const error = new NotFoundException();
      await loggerService.exception(error);
      
      expect(spyDebug).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.exception_debug_message', async () => {
      const error = new NotFoundException();
      const message = "New message";
      await loggerService.exception(error, message);
      
      expect(spyDebug).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledWith(message, 'debug', error);

    });

    it('loggerService.exception_error', async () => {
      await loggerService.exception(new Error());
      
      expect(spyError).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.error_no_stack', async () => {
      await loggerService.error(errorMessage);

      expect(spyError).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.error_with_stack', async () => {
      var err = new Error();
      await loggerService.error(errorMessage, err.stack);

      expect(spyError).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.error_with_stack_context', async () => {
      var err = new Error();
      await loggerService.error(errorMessage, err.stack, context);

      expect(spyError).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.warn', async () => {
      await loggerService.warn(errorMessage);
      
      expect(spyWarn).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.warn_context', async () => {
      await loggerService.warn(errorMessage, context);
      
      expect(spyWarn).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.debug', async () => {
      await loggerService.debug(errorMessage);
      
      expect(spyDebug).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.debug_context', async () => {
      await loggerService.debug(errorMessage, context);
      
      expect(spyDebug).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.verbose', async () => {
      await loggerService.verbose(errorMessage);
      
      expect(spyVerbose).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.verbose_context', async () => {
      await loggerService.verbose(errorMessage, context);
      
      expect(spyVerbose).toBeCalledTimes(1);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.log', async () => {
      await loggerService.log(errorMessage);
      
      expect(spyLog).toHaveBeenCalledWith(errorMessage, undefined);
      expect(spyTransportLog).toBeCalledTimes(1);
    });

    it('loggerService.log_context', async () => {
      await loggerService.log(errorMessage, context);
      
      // This is being called twoices because of a log on module initialized
      //expect(spyLog).toBeCalledTimes(2);
      expect(spyLog).toHaveBeenCalledWith(errorMessage, context);
      expect(spyTransportLog).toBeCalledTimes(1);
    });
  });
});
