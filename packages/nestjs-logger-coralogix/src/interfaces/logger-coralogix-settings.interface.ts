import { LoggerCoralogixConfigInterface } from './logger-coralogix-config.interface';
import { LoggerSettingsInterface } from '@concepta/nestjs-logger';

/**
 * Coralogix options interface.
 */
export interface LoggerCoralogixSettingsInterface
  extends Partial<Pick<LoggerSettingsInterface, 'logLevel'>>
{
  /**
   * 
   * @param
   * 
  */
  transportConfig: LoggerCoralogixConfigInterface;
}
