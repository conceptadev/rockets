import { registerAs } from '@nestjs/config';
import { AUTH_HISTORY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-history.constants';
import { AuthHistorySettingsInterface } from '../interfaces/auth-history-settings.interface';

/**
 * Default configuration for AuthHistory module.
 */
export const authHistoryDefaultConfig = registerAs(
  AUTH_HISTORY_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthHistorySettingsInterface => ({}),
);
