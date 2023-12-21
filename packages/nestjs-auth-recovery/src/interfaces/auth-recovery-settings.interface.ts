import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpCreatableInterface } from '@concepta/ts-common';

export interface AuthRecoveryOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'category' | 'type' | 'expiresIn'> {
  assignment: ReferenceAssignment;
}

export interface AuthRecoverySettingsInterface {
  email: {
    from: string;
    baseUrl: string;
    tokenUrlFormatter?: (baseUrl: string, passcode: string) => string;
    templates: {
      recoverLogin: {
        fileName: string;
        subject: string;
      };
      recoverPassword: {
        fileName: string;
        subject: string;
      };
      passwordUpdated: {
        fileName: string;
        subject: string;
      };
    };
  };
  otp: AuthRecoveryOtpSettingsInterface;
}
