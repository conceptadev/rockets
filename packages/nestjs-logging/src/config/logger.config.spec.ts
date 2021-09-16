import { loggerConfig } from './logger.config';

jest.mock('@sentry/node');

describe('loggerConfig', () => {
  let env: Record<string, string>;
  beforeEach(async () => {
    env = Object.assign({}, process.env);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('IsDefined', () => {
    it('was loggerConfig defined', async () => {
      expect(loggerConfig).toBeDefined();
    });
  });

  /**
   * Test with no env
   *
   */
  it('loggerConfig.no_env', async () => {
    process.env = null;
    expect(loggerConfig().logLevel).toStrictEqual(['error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual([]);
    process.env = env;
  });

  /**
   * Test with env empty
   *
   */
  it('loggerConfig.empty_env', async () => {
    process.env = {};
    expect(loggerConfig().logLevel).toStrictEqual(['error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual([]);
    process.env = env;
  });

  /**
   * Test with multiple log level
   *
   */
  it('loggerConfig.multiple_logs', async () => {
    process.env.LOG_LEVEL = 'log,error';
    expect(loggerConfig().logLevel).toStrictEqual(['log', 'error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual([]);
    process.env = env;
  });

  /**
   * Test with multiple log level and transport
   *
   */
  it('loggerConfig.multiple_logsNTransport', async () => {
    process.env.LOG_LEVEL = 'log,error';
    process.env.TRANSPORT_LOG_LEVEL = 'log,error';
    expect(loggerConfig().logLevel).toStrictEqual(['log', 'error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual(['log', 'error']);
    process.env = env;
  });
});
