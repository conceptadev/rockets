import { LogLevel } from '@nestjs/common';
import { NodeOptions as SentryNodeOptions } from '@sentry/node/dist/types';
import { Severity as SentrySeverity } from '@sentry/types';

export interface LoggerSentryConfigInterface extends SentryNodeOptions {
  logLevelMap: (logLevel: LogLevel) => SentrySeverity;
}
