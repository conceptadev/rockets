import { registerAs } from '@nestjs/config';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import {
  USER_MODULE_DEFAULT_SETTINGS_TOKEN,
  USER_MODULE_USER_PASSWORD_HISTORY_LIMIT_DAYS_DEFAULT,
} from '../user.constants';

/**
 * Default configuration for User module.
 */
export const userDefaultConfig = registerAs(
  USER_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): UserSettingsInterface => {
    // password history tracking is disabled by default
    const enabled = process.env?.USER_PASSWORD_HISTORY_ENABLED === 'true';

    // determine default limitation days
    const limitDays = process.env?.USER_PASSWORD_HISTORY_MAX_DAYS?.length
      ? Number(process.env?.USER_PASSWORD_HISTORY_MAX_DAYS)
      : USER_MODULE_USER_PASSWORD_HISTORY_LIMIT_DAYS_DEFAULT;

    return {
      passwordHistory: {
        enabled,
        limitDays: isNaN(limitDays) || limitDays < 1 ? undefined : limitDays,
      },
    };
  },
);
