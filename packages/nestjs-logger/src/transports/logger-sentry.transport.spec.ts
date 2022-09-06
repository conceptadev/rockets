import { LogLevel } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/node';
import { Severity as SentryLogSeverity } from '@sentry/types';

import { LOGGER_MODULE_SETTINGS_TOKEN } from '../config/logger.config';
import { LoggerSentryConfigInterface } from '../interfaces/logger-sentry-config.interface';
import { LoggerSettingsInterface } from '../interfaces/logger-settings.interface';
import { LoggerSentryTransport } from './logger-sentry.transport';

jest.mock('@sentry/node');

describe('loggerSentryTransport', () => {
  let loggerSentryTransport: LoggerSentryTransport;
  let settings: LoggerSettingsInterface;
  let spyInit: jest.SpyInstance;
  let spyCaptureException: jest.SpyInstance;
  let spyCaptureMessage: jest.SpyInstance;
  let spyLogLevelMap: jest.SpyInstance;
  let errorMessage: string;

  beforeEach(async () => {
    const transportSentryConfig: LoggerSentryConfigInterface = {
      dsn: '',
      logLevelMap: jest.fn().mockReturnValue(SentryLogSeverity.Error),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: LOGGER_MODULE_SETTINGS_TOKEN,
          useValue: {
            transportSentryConfig,
          },
        },
      ],
    }).compile();

    loggerSentryTransport = new LoggerSentryTransport(transportSentryConfig);

    settings = moduleRef.get<LoggerSettingsInterface>(
      LOGGER_MODULE_SETTINGS_TOKEN,
    );

    spyInit = jest.spyOn(Sentry, 'init');
    spyCaptureException = jest.spyOn(Sentry, 'captureException');
    spyCaptureMessage = jest.spyOn(Sentry, 'captureMessage');
    if (settings && settings.transportSentryConfig) {
      spyLogLevelMap = jest.spyOn(
        settings.transportSentryConfig,
        'logLevelMap',
      );
    } else {
      throw new Error('transportSentryConfig is not defined');
    }

    errorMessage = 'Jest Error Message';
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('IsDefined', () => {
    it('was loggerSentryTransport defined', async () => {
      expect(loggerSentryTransport).toBeDefined();
    });
  });

  /**
   * Test check if Sentry init was called
   */
  it('LoggerSentryTransport.init', async () => {
    expect(spyInit).toBeCalledTimes(1);
  });

  /**
   * Test Log level map with capture exception
   */
  it('LoggerSentryTransport.captureException', async () => {
    const logLevel = 'log' as LogLevel;
    const error = new Error();
    loggerSentryTransport.log(errorMessage, logLevel, error);

    expect(spyLogLevelMap).toBeCalledTimes(1);
    expect(spyCaptureException).toBeCalledTimes(1);
  });

  /**
   * Make sure call was made correctly
   *
   */
  it('LoggerSentryTransport.correctValues', async () => {
    const logLevel = 'log' as LogLevel;
    const error = new Error();
    loggerSentryTransport.log(errorMessage, logLevel, error);

    expect(spyLogLevelMap).toBeCalledTimes(1);
    expect(spyLogLevelMap).toHaveBeenCalledWith(logLevel);
    expect(spyCaptureException).toBeCalledTimes(1);
    expect(spyCaptureException).toHaveBeenCalledWith(error, {
      level: SentryLogSeverity.Error,
      extra: { developerMessage: errorMessage },
    });
  });

  /**
   * Test Log level map with capture message
   */
  it('LoggerSentryTransport.captureMessage', async () => {
    const logLevel = 'log' as LogLevel;

    loggerSentryTransport.log(errorMessage, logLevel);

    expect(spyLogLevelMap).toBeCalledTimes(1);
    expect(spyCaptureException).toBeCalledTimes(0);
    expect(spyCaptureMessage).toBeCalledTimes(1);
  });
});
