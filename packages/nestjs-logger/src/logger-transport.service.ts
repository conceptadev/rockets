import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { LOGGER_MODULE_SETTINGS_TOKEN } from './config/logger.config';
import { LoggerSettingsInterface } from './interfaces/logger-settings.interface';
import { LoggerTransportInterface } from './interfaces/logger-transport.interface';

/**
 * A transport service that will load all third party transport
 * that will be used to log messages to external
 *
 * @example
 * ```ts
 * class TestTransport implements LoggerTransportInterface {
 *     log(): void {
 *       // forward message to transport
 *     }
 * }
 *
 * const app = await NestFactory.create(AppModule, {
 *   logger: loggerConfig().logLevel,
 * });
 *
 * const customLoggerService = app.get(LoggerService);
 *
 * const testTransport = new TestTransport();
 *
 * customLoggerService.addTransport(testTransport);
 * ```
 */
@Injectable()
export class LoggerTransportService {
  /**
   * Log level definitions
   *
   */
  private readonly logLevels: LogLevel[] = ['error'];

  /**
   * External Logger transports
   */
  private readonly loggerTransports: LoggerTransportInterface[] = [];

  /**
   * Constructor
   *
   * @param config - The configuration
   */
  constructor(
    @Inject(LOGGER_MODULE_SETTINGS_TOKEN)
    protected readonly config: LoggerSettingsInterface,
  ) {
    // TODO: this should change to get it from the transport modules
    if (this.config?.logLevel) {
      this.logLevels = this.config.logLevel;
    }
  }

  /**
   * Method to add the transport that will be used
   *
   * @param transport - transport to be added
   */
  public addTransport(transport: LoggerTransportInterface): void {
    this.loggerTransports.push(transport);
  }

  /**
   * Method to log message to the transport based on the log level
   *
   * @param message - Message to log
   * @param logLevel - level of severity
   * @param error - Error
   */
  public log(message: string, logLevel: LogLevel, error?: Error): void {
    this.loggerTransports.map((loggerTransport) => {
      // get log levels of the transport, or fallback for the logger config
      const logLevels = loggerTransport.logLevel || this.logLevels;

      // are we supposed to send this log level based on transport
      if (logLevels.includes(logLevel)) {
        return loggerTransport.log(message, logLevel, error);
      }
    });
  }
}
