import { registerAs } from '@nestjs/config';
import { AUTH_VERIFY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-verify.constants';
import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { formatTokenUrl } from '../auth-verify.utils';

/**
 * Default configuration for auth verify.
 */
export const authVerifyDefaultConfig = registerAs(
  AUTH_VERIFY_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthVerifySettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
      tokenUrlFormatter: formatTokenUrl,
      templates: {
        verifyEmail: {
          fileName: __dirname + '/../assets/verify.template.hbs',
          subject: 'Verify Email',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      category: 'auth-verify',
      type: 'uuid',
      expiresIn: '24h',
    },
  }),
);
