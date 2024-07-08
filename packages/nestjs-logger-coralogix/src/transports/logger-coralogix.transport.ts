import { LoggerTransportInterface } from '@concepta/nestjs-logger';
import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { CoralogixLogger, Log, LoggerConfig } from 'coralogix-logger';
import { LoggerCoralogixSettingsInterface } from '../interfaces/logger-coralogix-settings.interface';
import { LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN } from '../config/logger-coralogix.config';

@Injectable()
export class LoggerCoralogixTransport implements LoggerTransportInterface {
  private coralogix: CoralogixLogger;

  public logLevel?: LogLevel[] | null;

  constructor(
    @Inject(LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN)
    protected readonly settings: LoggerCoralogixSettingsInterface,
  ) {
    const config = settings.transportConfig;
    if (!config?.privateKey)
      throw new Error('Coralogix privateKey is required');
    const coralogixConfig = new LoggerConfig(config);

    this.logLevel = settings.logLevel;
    this.coralogix = new CoralogixLogger(config.category);

    CoralogixLogger.configure(coralogixConfig);
  }

  setCategory(category: string) {
    this.coralogix.category = category;
  }

  /**
   * Method to log message to Coralogix transport
   *
   * @param message
   * @param logLevel
   * @param error
   */
  log(message: string, logLevel: LogLevel, error?: Error | string): void {
    // map the internal log level to coralogix log severity
    const severity = this.settings.transportConfig.logLevelMap(logLevel);
    const formatMessage = this.settings.transportConfig?.formatMessage;
    const text = formatMessage
      ? formatMessage({ message, logLevel, error })
      : `${message}`;

    // create a log
    const log = new Log({
      severity: severity,
      text,
    });

    // send log to coralogix
    this.coralogix.addLog(log);
  }
}
