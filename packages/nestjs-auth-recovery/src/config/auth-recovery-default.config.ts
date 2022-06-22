import { registerAs } from '@nestjs/config';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-recovery.constants';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';

/**
 * Default configuration for auth github.
 */
export const authRecoveryDefaultConfig = registerAs(
  AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthRecoverySettingsInterface => ({
    loginTemplate: 'login-template.hbs',
    passwordTemplate: 'password-reset-template.hbs',
    successTemplate: 'password-reset-success-template.hbs',
  }),
);
