import { ReferenceAssignment } from '@concepta/nestjs-common';
import { OtpCreatableInterface } from '@concepta/nestjs-common';

export interface InvitationOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'type' | 'expiresIn'> {
  assignment: ReferenceAssignment;
  clearOtpOnCreate?: boolean;
}

export interface InvitationSettingsInterface {
  email: {
    from: string;
    baseUrl: string;
    templates: {
      invitation: {
        logo: string;
        fileName: string;
        subject: string;
      };
      invitationAccepted: {
        logo: string;
        fileName: string;
        subject: string;
      };
    };
  };
  otp: InvitationOtpSettingsInterface;
}
