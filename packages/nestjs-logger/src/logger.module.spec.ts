import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { loggerConfig } from './config/logger.config';
import { LoggerOptionsInterface } from './interfaces/logger-options.interface';
import { LoggerSettingsInterface } from './interfaces/logger-settings.interface';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerExceptionFilter } from './logger-exception.filter';

import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';

describe('LoggerModule', () => {
  describe('forRoot with defaults', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();

      moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.register()],
      }).compile();
    });

    it('module should be defined', async () => {
      const loggerService = moduleRef.get(LoggerService);
      
      const loggerTransportService = moduleRef.get<LoggerTransportService>(
        LoggerTransportService,
      );

      const loggerExceptionFilter = moduleRef.get<LoggerExceptionFilter>(
        LoggerExceptionFilter,
      );

      // This is to inform that this logger will new used internally
      // or it will be used once yuo do a new Logger()
      moduleRef.useLogger(loggerService);

      expect(loggerService).toBeInstanceOf(LoggerService);
      
      expect(loggerTransportService).toBeInstanceOf(LoggerTransportService);
      expect(loggerExceptionFilter).toBeInstanceOf(LoggerExceptionFilter);
      expect(loggerTransportService['loggerTransports'].length).toBe(1);
    });
  });

  describe('forRoot with overrides', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();

      const config = await loggerConfig();

      moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.register({
          settings: {
            ...config,
            logLevel: ['debug']
          }
        })],
      }).compile();
    });

    it('module should be defined', async () => {
      expect(moduleRef).toBeInstanceOf(TestingModule);
    });
  });

  describe('forRootAsync', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();
      moduleRef = await Test.createTestingModule({
        imports: [
          LoggerModule.registerAsync({
            imports: [ConfigModule.forFeature(loggerConfig)],
            inject: [loggerConfig.KEY],
            useFactory: async (
              config: LoggerSettingsInterface,
            ): Promise<LoggerOptionsInterface> => {
              return {
                settings: {
                  ...config,
                  logLevel: ['debug'],
                  transportLogLevel: ['debug'],
                }
              };
            },
          }),
        ],
        providers: [],
      }).compile();
    });

    it('module should be defined', async () => {
      const loggerService = moduleRef.get(LoggerService);
      
      const loggerTransportService = moduleRef.get<LoggerTransportService>(
        LoggerTransportService,
      );

      // This is to inform that this logger will new used internally
      // or it will be used once yuo do a new Logger()
      moduleRef.useLogger(loggerService);

      expect(loggerService).toBeInstanceOf(LoggerService);
      
      expect(loggerTransportService).toBeInstanceOf(LoggerTransportService);
      expect(loggerTransportService['loggerTransports'].length).toBe(1);
    });
  });
});
