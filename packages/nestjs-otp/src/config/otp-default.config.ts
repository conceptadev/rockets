import { OtpOptionsInterface } from '../interfaces/otp-options.interface';
import { registerAs } from '@nestjs/config';
import { OTP_MODULE_DEFAULT_SETTINGS_TOKEN } from '../otp.constants';

/**
 * Default configuration for Otp module.
 */
export const otpDefaultConfig = registerAs(
  OTP_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): OtpOptionsInterface => ({}),
);
