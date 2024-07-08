import { LogLevel } from '@nestjs/common';
import { LoggerMessageInterface } from './logger-message.interface';

export interface LoggerConfigInterface {
  // TODO: should this ve moved to settings instead?

  /**
   *
   * @param logLevel - level of severity
   * @returns The logLevel of the transport
   */
  logLevelMap: (logLevel: LogLevel) => unknown;

  /**
   * method to format a message based on properties of the logger
   *
   * @param loggerMessage - object with all properties to create a message
   * @returns
   */
  // TODO: should this ve moved to settings instead?
  formatMessage?: (loggerMessage: LoggerMessageInterface) => string;
}
