import { LoggerConfigInterface } from '@concepta/nestjs-logger';
import { LogLevel } from '@nestjs/common';
import { Severity, LoggerConfig } from "coralogix-logger";
/**
 * Interface for Sentry configuration to define the log level
 * mapping to be used on Sentry transport.
 */
export interface LoggerCoralogixConfigInterface
  extends LoggerConfigInterface, Pick<LoggerConfig, 'privateKey'>,
    Partial<Omit<LoggerConfig, 'privateKey'>> {

  category: string ;
  /**
   * Method to map the log level from the config with sentry log levels
   */
  // TODO: should this ve moved to settings
  logLevelMap: (logLevel: LogLevel) => Severity;

}
