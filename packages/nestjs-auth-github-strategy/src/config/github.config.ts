import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { LogLevel } from '@nestjs/common';

import { Severity as SentryLogSeverity } from '@sentry/types';
import { GithubOptionsInterface } from '../interfaces/github-options.interface';


export const GITHUB_MODULE_OPTIONS_TOKEN = 'GITHUB_MODULE_OPTIONS';

export type GithubConfigFactory = ConfigFactory<GithubOptionsInterface> &
  ConfigFactoryKeyHost;

/**
 * Configuration for Logger.
 *
 * ### example
 * ```ts
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({clientId: '...', clientSecret: '...', callbackURL: '...'}),
 *   ],
 *  ...
 * })
 * ```
 */
export const loggerConfig: GithubConfigFactory = registerAs(
  GITHUB_MODULE_OPTIONS_TOKEN,
  (): GithubOptionsInterface => ({
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || ''
  }),
);
