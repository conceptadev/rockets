import { OptionsInterface } from '@concepta/ts-core';
import { OtpCreatableInterface } from '@concepta/ts-common';

export interface AuthRecoveryOtpSettingsInterface
  extends OtpCreatableInterface {
  assignment: string;
}

export interface AuthRecoverySettingsInterface extends OptionsInterface {
  email: {
    from: string;
    baseUrl: string;
    templates: {
      recoverLogin: {
        fileName: string;
        subject: string;
      };
      recoverPassword: {
        fileName: string;
        subject: string;
      };
    };
  };
  otp: AuthRecoveryOtpSettingsInterface;
}
