import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';
import { LocalStrategyConfigOptionsInterface as LocalStrategyConfigOptionsInterface } from '../interfaces/local-auth-config-options.interface';

export const GET_USER_SERVICE_TOKEN = 'GET_USER_SERVICE_TOKEN';
export const ISSUE_TOKEN_SERVICE_TOKEN = 'ISSUE_TOKEN_SERVICE_TOKEN';

export const LOCAL_STRATEGY_MODULE_CONFIG_TOKEN =
  'LOCAL_STRATEGY_MODULE_CONFIG_TOKEN';

/**
 * Local strategy config factory type.
 */
export type LocalStrategyConfigFactory =
  ConfigFactory<LocalStrategyConfigOptionsInterface> & ConfigFactoryKeyHost;

/**
 * Configuration for local strategy.
 *
 * ### example
 * ```ts
 *
 *
 *
 *
 *
 *
 * ```
 */
export const localStrategyConfig: LocalStrategyConfigFactory = registerAs(
  LOCAL_STRATEGY_MODULE_CONFIG_TOKEN,
  (): LocalStrategyConfigOptionsInterface => ({
    /**
     * The field name to use for the username.
     */
    usernameField: process.env.LOCAL_STRATEGY_USERNAME_FIELD ?? 'username',

    /**
     * The field name to use for the password.
     */
    passwordField: process.env.LOCAL_STRATEGY_PASSWORD_FIELD ?? 'password',
  }),
);
