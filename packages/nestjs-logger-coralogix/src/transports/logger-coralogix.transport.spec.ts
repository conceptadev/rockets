import { Log } from 'coralogix-logger';
import { LoggerCoralogixConfigInterface } from '../interfaces/logger-coralogix-config.interface';
import { LoggerCoralogixSettingsInterface } from '../interfaces/logger-coralogix-settings.interface';
import { LoggerCoralogixTransport } from './logger-coralogix.transport';

describe('loggerCoralogixTransport', () => {
  let loggerCoralogixTransport: LoggerCoralogixTransport;
  let settings: LoggerCoralogixSettingsInterface;
  let spyLogLevelMap: jest.SpyInstance;
  let errorMessage: string;
  

  beforeEach(async () => {
    const transportConfig: LoggerCoralogixConfigInterface = {
      privateKey: '',
      category: 'testers',
      logLevelMap: jest.fn().mockReturnValue(3),
    };
    const transportSettings: LoggerCoralogixSettingsInterface = {
      transportConfig,
      logLevel: ['error'],
    }
    loggerCoralogixTransport = new LoggerCoralogixTransport(transportSettings);
  });

  describe('IsDefined', () => {
    it('was loggerCoralogixTransport defined', async () => {
      expect(loggerCoralogixTransport).toBeDefined();
    });
  });

  it('LoggerCoralogixTransport initialized with correct log levels and category', async () => {
    const expectedLogLevels = ['error'];
    const expectedCategory = 'testers';

    expect(loggerCoralogixTransport.logLevel).toEqual(expectedLogLevels);
    expect(loggerCoralogixTransport['coralogix'].category).toEqual(expectedCategory);
  });

  it('should log a message with the correct severity and formatted text', () => {
    const message = 'Test message';
    const logLevel = 'log';
    const error = 'Test error';

    loggerCoralogixTransport.log(message, logLevel, error);

    expect(settings.transportConfig.logLevelMap).toHaveBeenCalledWith(logLevel);
    expect(settings.transportConfig.formatMessage).toHaveBeenCalledWith({ message, logLevel, error });

    const expectedLog = new Log({
      severity: 3,
      text: 'Test message',
    });

    expect(loggerCoralogixTransport['coralogix'].addLog).toHaveBeenCalledWith(expectedLog);
  });
});
