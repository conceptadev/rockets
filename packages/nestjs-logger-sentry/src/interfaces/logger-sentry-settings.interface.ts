import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';
import { LoggerSettingsInterface } from '@concepta/nestjs-logger';

/**
 * LoggerSentry options interface.
 */
export interface LoggerSentrySettingsInterface
  extends Partial<Pick<LoggerSettingsInterface, 'logLevel'>> {
  // TODO: reavaliate that loglevel should be inside the config instead
  transportConfig: LoggerSentryConfigInterface;
}
