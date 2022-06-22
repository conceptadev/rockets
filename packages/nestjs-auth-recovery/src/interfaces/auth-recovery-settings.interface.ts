import { OptionsInterface } from '@concepta/ts-core';

export interface AuthRecoverySettingsInterface extends OptionsInterface {
  loginTemplate: string;
  passwordTemplate: string;
  successTemplate: string;
}
