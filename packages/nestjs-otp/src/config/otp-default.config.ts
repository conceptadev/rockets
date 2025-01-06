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
    types: {
      uuid: {
        generator: uuidGeneratorUtil,
        validator: uuidValidatorUtil,
      },
    },
    clearOnCreate: process.env.OTP_CLEAR_ON_CREATE == 'true' ? true : false,
  }),
);
