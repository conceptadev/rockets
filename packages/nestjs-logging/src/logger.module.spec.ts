import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { loggerConfig } from './config/logger.config';
import { LoggerOptionsInterface } from './interfaces/logger-options.interface';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';

describe('LoggerModule', () => {
  describe('forRoot with defaults', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();

      moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.forRoot()],
      }).compile();
    });

    it('module should be defined', async () => {
      const loggerService = moduleRef.get(LoggerService);
      const loggerSentryTransport = moduleRef.get<LoggerSentryTransport>(
        LoggerSentryTransport,
      );
      const loggerTransportService = moduleRef.get<LoggerTransportService>(
        LoggerTransportService,
      );

      loggerService.addTransport(loggerSentryTransport);

      // This is to inform that this logger will new used internally
      // or it will be used once yuo do a new Logger()
      moduleRef.useLogger(loggerService);

      expect(loggerService).toBeInstanceOf(LoggerService);
      expect(loggerSentryTransport).toBeInstanceOf(LoggerSentryTransport);
      expect(loggerTransportService).toBeInstanceOf(LoggerTransportService);
      expect(loggerTransportService['loggerTransports'].length).toBe(1);
    });
  });

  describe('forRoot with overrides', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();

      const config = await loggerConfig();

      moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.forRoot({ ...config, logLevel: ['debug'] })],
      }).compile();
    });

    it('module should be defined', async () => {
      expect(moduleRef).toBeInstanceOf(TestingModule);
    });
  });

  describe('forRootAsync', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          LoggerModule.forRootAsync({
            imports: [ConfigModule.forFeature(loggerConfig)],
            inject: [loggerConfig.KEY],
            useFactory: async (
              config: LoggerOptionsInterface,
            ): Promise<LoggerOptionsInterface> => {
              return {
                ...config,
                logLevel: ['debug'],
                transportLogLevel: ['debug'],
              };
            },
          }),
        ],
        providers: [],
      }).compile();
    });

    it('module should be defined', async () => {
      const loggerService = moduleRef.get(LoggerService);
      const loggerSentryTransport = moduleRef.get<LoggerSentryTransport>(
        LoggerSentryTransport,
      );
      const loggerTransportService = moduleRef.get<LoggerTransportService>(
        LoggerTransportService,
      );

      loggerService.addTransport(loggerSentryTransport);

      // This is to inform that this logger will new used internally
      // or it will be used once yuo do a new Logger()
      moduleRef.useLogger(loggerService);

      expect(loggerService).toBeInstanceOf(LoggerService);
      expect(loggerSentryTransport).toBeInstanceOf(LoggerSentryTransport);
      expect(loggerTransportService).toBeInstanceOf(LoggerTransportService);
      expect(loggerTransportService['loggerTransports'].length).toBe(1);
    });
  });
});
