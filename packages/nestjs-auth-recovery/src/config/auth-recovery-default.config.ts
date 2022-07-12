import { registerAs } from '@nestjs/config';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-recovery.constants';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';

/**
 * Default configuration for auth github.
 */
export const authRecoveryDefaultConfig = registerAs(
  AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthRecoverySettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
      templates: {
        recoverLogin: {
          fileName: __dirname + '/../assets/recover-login.template.hbs',
          subject: 'Login Recovery',
        },
        recoverPassword: {
          fileName: __dirname + '/../assets/recover-password.template.hbs',
          subject: 'Password Recovery',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      category: 'auth-recovery',
      type: 'uuid',
      expiresIn: '1h',
    },
  }),
);
