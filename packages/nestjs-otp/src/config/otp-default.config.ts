import { registerAs } from '@nestjs/config';
import { OTP_MODULE_DEFAULT_SETTINGS_TOKEN } from '../otp.constants';
import { OtpUtils } from '../utils/otp.utils';
import { OtpSettingsInterface } from '../interfaces/otp-settings.interface';

/**
 * Default configuration for Otp module.
 */
export const otpDefaultConfig = registerAs(
  OTP_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): OtpSettingsInterface => ({
    expiresIn: '1h',
    types: {
      uuid: new OtpUtils(),
    },
  }),
);
