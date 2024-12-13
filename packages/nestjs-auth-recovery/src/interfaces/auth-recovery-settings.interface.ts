import { ReferenceAssignment } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '@concepta/nestjs-common';

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
