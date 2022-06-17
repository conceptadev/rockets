import { registerAs } from '@nestjs/config';
import { OTP_MODULE_DEFAULT_SETTINGS_TOKEN } from '../otp.constants';
import { OtpSettingsInterface } from '../interfaces/otp-settings.interface';
import { uuidGeneratorUtil } from '../utils/uuid-generator.util';
import { uuidValidatorUtil } from '../utils/uuid-validator.util';

/**
 * Default configuration for Otp module.
 */
export const otpDefaultConfig = registerAs(
  OTP_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): OtpSettingsInterface => ({
    expiresIn: '1h',
    types: {
      uuid: {
        generator: uuidGeneratorUtil,
        validator: uuidValidatorUtil,
      },
    },
  }),
);
