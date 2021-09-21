import { Inject, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';
class TestLogger {
  constructor(@Inject(LoggerService) private loggerService: LoggerService) {}

  testLoggerServiceLog(): void {
    this.loggerService.log('Message from testLoggerServiceLog');
  }

  testLoggerLog(): void {
    const logger = new Logger();
    logger.log('Message from testLoggerLog');
  }
}

describe('LoggerModule', () => {
  let moduleRef: TestingModule;
  let testLogger: TestLogger;

  describe('IsDefined', () => {
    it('was module defined', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.forRoot()],
        providers: [TestLogger],
      }).compile();

      testLogger = moduleRef.get(TestLogger);

      const customLoggerService = moduleRef.get(LoggerService);
      const loggerSentryTransport = moduleRef.get<LoggerSentryTransport>(
        LoggerSentryTransport,
      );

      customLoggerService.addTransport(loggerSentryTransport);
      //jest.spyOn(customLoggerService, 'log').mockImplementation(() => null);

      // This is to inform that this logger will new used internally
      // or it will be used once yuo do a new Logger()
      moduleRef.useLogger(customLoggerService);

      expect(testLogger).toBeDefined();
      expect(moduleRef).toBeDefined();
    });

    it('Called from module import', async () => {
      const loggerTransportService = moduleRef.get<LoggerTransportService>(
        LoggerTransportService,
      );
      const spyTransportLog = jest.spyOn(loggerTransportService, 'log');

      // Check if transport was added to the instance
      expect(loggerTransportService['loggerTransports'].length).toBe(1);

      testLogger.testLoggerServiceLog();
      expect(spyTransportLog).toBeCalledTimes(1);

      testLogger.testLoggerLog();
      expect(spyTransportLog).toBeCalledTimes(2);
    });



  });
});
