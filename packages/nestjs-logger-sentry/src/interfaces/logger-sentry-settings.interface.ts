import { SeverityLevel } from '@sentry/types';
import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';
import {
  LoggerSettingsInterface,
  LoggerTransportSettingsInterface,
} from '@concepta/nestjs-logger';

/**
 * LoggerSentry options interface.
 */
export interface LoggerSentrySettingsInterface
  extends Partial<Pick<LoggerSettingsInterface, 'logLevel'>>,
    LoggerTransportSettingsInterface<SeverityLevel> {
  /**
   *
   * @param transportConfig - The Sentry configuration
   */
  transportConfig: LoggerSentryConfigInterface;
}
