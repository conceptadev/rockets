import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { loggerConfig } from './config/logger.config';
import { LoggerTransportInterface } from './interfaces/logger-transport.interface';

/**
 *
 * A transport service that will load all third party transport
 * that will be used to log messages to external
 * 
 * ### Example
 * ```ts
 * class TestTransport implements LoggerTransportInterface {
 *     log(): void { }
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
 *     
 *```
 * 
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
   * 
   */
  private readonly loggerTransports: LoggerTransportInterface[] = [];

  constructor(
    @Inject(loggerConfig.KEY) private config: ConfigType<typeof loggerConfig>
  ) {
    if (this.config?.transportLogLevel) {
      this.logLevels = this.config.transportLogLevel;
    }
  }

  /**
   * Method to add the transport that will be used
   * 
   * @param transport 
   */
  public addTransport(transport: LoggerTransportInterface): void {
    this.loggerTransports.push(transport);
  }

  /**
   * Method to log message to the transport based on the log level
   * 
   * @param message 
   * @param logLevel 
   * @param error 
   */
  public log(message: string, logLevel: LogLevel, error?: Error): void {
    // are we supposed to send this log level?
    if (this.logLevels.includes(logLevel)) {
      // yes, call all logger transports
      this.loggerTransports.map(loggerTransport =>
        loggerTransport.log(message, logLevel, error)
      );
    }
  }
}
