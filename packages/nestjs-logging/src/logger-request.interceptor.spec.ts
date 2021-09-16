import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerService } from './logger.service';
import ErrorFormat from './helpers/error.format';
import {
  FastifyRequest as Request,
  LightMyRequestResponse as Response,
} from 'fastify';

describe('LoggerRequestInterceptor', () => {
  let loggerRequestInterceptor: LoggerRequestInterceptor;
  let loggerService: LoggerService;
  let spyFormatRequestMessage: jest.SpyInstance;
  let spyLog: jest.SpyInstance;
  let spyFormatResponseMessage: jest.SpyInstance;
  let spyException: jest.SpyInstance;

  const callHandler = {
    handle: () => {
      const pipe = () => {
        return true;
      };
      return {
        pipe,
      };
    },
  } as unknown as CallHandler;

  const executionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnThis(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoggerRequestInterceptor,
        {
          provide: LoggerService,
          useValue: {
            formatRequestMessage: jest.fn(),
            log: jest.fn(),
            formatResponseMessage: jest.fn(),
            exception: jest.fn(),
          },
        },
      ],
    }).compile();

    loggerService = moduleRef.get<LoggerService>(LoggerService);
    loggerRequestInterceptor = moduleRef.get<LoggerRequestInterceptor>(
      LoggerRequestInterceptor,
    );

    spyFormatRequestMessage = jest.spyOn(ErrorFormat, 'formatRequestMessage');
    spyFormatResponseMessage = jest.spyOn(ErrorFormat, 'formatResponseMessage');
    spyLog = jest.spyOn(loggerService, 'log');
    spyException = jest.spyOn(loggerService, 'exception');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('IsDefined', () => {
    it('was LoggerTransportService defined', async () => {
      expect(loggerRequestInterceptor).toBeDefined();
    });
  });

  it('LoggerRequestInterceptor.intercept', async () => {
    const actualValue = await loggerRequestInterceptor.intercept(
      executionContext as ExecutionContext,
      callHandler,
    );

    expect(actualValue).toBeTruthy();
    expect(spyFormatRequestMessage).toBeCalledTimes(1);
    expect(spyLog).toBeCalledTimes(1);
  });

  it('LoggerRequestInterceptor.intercept_2', async () => {
    const actualValue = await loggerRequestInterceptor.intercept(
      executionContext as ExecutionContext,
      callHandler,
    );

    expect(actualValue).toBeTruthy();
    expect(spyFormatRequestMessage).toBeCalledTimes(1);
    expect(spyLog).toBeCalledTimes(1);
  });

  it('LoggerRequestInterceptor.responseSuccess', async () => {
    await loggerRequestInterceptor.responseSuccess({} as Request, {} as Response, new Date());

    expect(spyFormatResponseMessage).toBeCalledTimes(1);
    expect(spyLog).toBeCalledTimes(1);
  });

  it('LoggerRequestInterceptor.responseError', async () => {
    await loggerRequestInterceptor.responseError(
      {} as Request,
      {} as Response,
      new Date(),
      new Error(),
    );

    expect(spyFormatResponseMessage).toBeCalledTimes(1);
    expect(spyException).toBeCalledTimes(1);
  });

  it('LoggerRequestInterceptor to throwError', async () => {
    const observer = await loggerRequestInterceptor.responseError(
      {} as Request,
      {} as Response,
      new Date(),
      new Error('TestError'),
    );

    expect(observer.subscribe).toThrowError();
  });
});
