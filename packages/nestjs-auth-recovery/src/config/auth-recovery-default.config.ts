import { registerAs } from '@nestjs/config';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-recovery.constants';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { formatTokenUrl } from '../auth-recovery.utils';

/**
 * Default configuration for auth recovery.
 */
export const authRecoveryDefaultConfig = registerAs(
  AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthRecoverySettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
      tokenUrlFormatter: formatTokenUrl,
      templates: {
        recoverLogin: {
          fileName: __dirname + '/../assets/recover-login.template.hbs',
          subject: 'Login Recovery',
        },
        recoverPassword: {
          fileName: __dirname + '/../assets/recover-password.template.hbs',
          subject: 'Password Recovery',
        },
        passwordUpdated: {
          fileName:
            __dirname + '/../assets/password-updated-successfully.template',
          subject: 'Password Updated Successfully',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      category: 'auth-recovery',
      type: 'uuid',
      expiresIn: '1h',
      clearOtpOnCreate: process.env.AUTH_RECOVERY_OTP_CLEAR_ON_CREATE
        ? process.env.AUTH_RECOVERY_OTP_CLEAR_ON_CREATE === 'true'
        : undefined,
    },
  }),
);
