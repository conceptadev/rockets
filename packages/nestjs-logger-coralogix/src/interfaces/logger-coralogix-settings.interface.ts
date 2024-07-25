import { LoggerCoralogixConfigInterface } from './logger-coralogix-config.interface';
import {
  LoggerSettingsInterface,
  LoggerTransportSettingsInterface,
} from '@concepta/nestjs-logger';
import { Severity } from 'coralogix-logger';
/**
 * Coralogix options interface.
 */
export interface LoggerCoralogixSettingsInterface
  extends Partial<Pick<LoggerSettingsInterface, 'logLevel'>>,
    LoggerTransportSettingsInterface<Severity> {
  /**
   *
   * @param transportConfig - The coralogix configuration
   */
  transportConfig: LoggerCoralogixConfigInterface;
}
