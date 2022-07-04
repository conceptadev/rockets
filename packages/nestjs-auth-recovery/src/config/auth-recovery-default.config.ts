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
          fileName: 'recover-login.template.hbs',
          subject: 'Login Recovery',
        },
        recoverPassword: {
          fileName: 'recover-password.template.hbs',
          subject: 'Password Recovery',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      type: 'uuid',
      assignee: {
        id: 'id',
      },
      category: 'auth-recovery',
    },
  }),
);
