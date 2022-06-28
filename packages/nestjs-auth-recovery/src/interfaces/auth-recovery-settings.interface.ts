import { OptionsInterface } from '@concepta/ts-core';
import { OtpCreatableInterface } from '@concepta/ts-common';

export interface AuthRecoveryOtpSettingsInterface
  extends OtpCreatableInterface {
  assignment: string;
  resetTokenExp: Date;
}

export interface AuthRecoverySettingsInterface extends OptionsInterface {
  email: {
    from: string;
    baseUrl: string;
    recoverPasswordTemplate: string;
    recoverPasswordEmailSubject: string;
  };
  otp: AuthRecoveryOtpSettingsInterface;
}
