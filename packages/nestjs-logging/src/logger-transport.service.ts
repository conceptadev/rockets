import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { loggerConfig } from './config/logger.config';
import { LoggerTransportInterface } from './interfaces/logger-transport.interface';

@Injectable()
export class LoggerTransportService {
  private readonly logLevels: LogLevel[] = ['error'];
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
   * @param transport 
   */
  public addTransport(transport: LoggerTransportInterface): void {
    this.loggerTransports.push(transport);
  }

  /**
   * Method to log message to the transport based on the log level
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
