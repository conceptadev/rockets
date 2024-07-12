import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';
import { LoggerSettingsInterface, LoggerTransportSettingsInterface } from '@concepta/nestjs-logger';
import { Severity } from '@sentry/types';
/**
 * LoggerSentry options interface.
 */
export interface LoggerSentrySettingsInterface
  extends Partial<Pick<LoggerSettingsInterface, 'logLevel'>>,
  LoggerTransportSettingsInterface<Severity>{
  /**
   *
   * @param transportConfig - The Sentry configuration
   */
  transportConfig: LoggerSentryConfigInterface;
}
