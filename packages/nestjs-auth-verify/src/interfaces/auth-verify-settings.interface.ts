import { ReferenceAssignment } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '@concepta/nestjs-common';

export interface AuthVerifyOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'category' | 'type' | 'expiresIn'> {
  assignment: ReferenceAssignment;
  clearOtpOnCreate?: boolean;
}

export interface AuthVerifySettingsInterface {
  email: {
    from: string;
    baseUrl: string;
    tokenUrlFormatter?: (baseUrl: string, passcode: string) => string;
    templates: {
      verifyEmail: {
        fileName: string;
        subject: string;
      };
    };
  };
  otp: AuthVerifyOtpSettingsInterface;
}
