import { OptionsInterface } from '@concepta/ts-core';
import { OtpSettingsInterface } from './otp-settings.interface';

export interface OtpOptionsInterface extends OptionsInterface {
  settings?: OtpSettingsInterface;
}
