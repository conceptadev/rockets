import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpInterface } from '@concepta/ts-common';

export interface AuthRecoveryOtpSettingsInterface
  extends Pick<OtpInterface, 'category' | 'type'> {
  assignment: ReferenceAssignment;
}

export interface AuthRecoverySettingsInterface {
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
