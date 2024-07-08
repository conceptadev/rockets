import { LoggerConfigInterface } from '@concepta/nestjs-logger';
import { LoggerMessageInterface } from '@concepta/nestjs-logger/dist/interfaces/logger-message.interface';
import { LogLevel } from '@nestjs/common';
import { Severity, LoggerConfig } from 'coralogix-logger';
/**
 * Interface for Coralogix configuration to define the log level
 * mapping to be used on Coralogix transport.
 */
export interface LoggerCoralogixConfigInterface
  extends LoggerConfigInterface,
    Pick<LoggerConfig, 'privateKey'>,
    Partial<Omit<LoggerConfig, 'privateKey'>> {
  category: string;
  /**
   * Method to map the log level from the config with Coralogix log levels
   */
  // TODO: should this ve moved to settings?
  logLevelMap: (logLevel: LogLevel) => Severity;

  formatMessage?: (loggerMessage: LoggerMessageInterface) => string;
}
