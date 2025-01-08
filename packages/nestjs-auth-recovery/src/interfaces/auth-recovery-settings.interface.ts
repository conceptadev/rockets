import { ReferenceAssignment } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '@concepta/nestjs-common';

export interface AuthRecoveryOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'category' | 'type' | 'expiresIn'> {
  assignment: ReferenceAssignment;
  clearOtpOnCreate?: boolean;
}

export interface AuthRecoverySettingsInterface {
  email: {
    from: string;
    baseUrl: string;
    tokenUrlFormatter?: (baseUrl: string, passcode: string) => string;
    templates: {
      recoverLogin: {
        logo: string;
        fileName: string;
        subject: string;
      };
      recoverPassword: {
        logo: string;
        fileName: string;
        subject: string;
      };
      passwordUpdated: {
        logo: string;
        fileName: string;
        subject: string;
      };
    };
  };
  otp: AuthRecoveryOtpSettingsInterface;
}
