import { ReferenceAssignment } from '@concepta/ts-core';
import { OtpCreatableInterface } from '@concepta/ts-common';

export interface InvitationOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'type' | 'expiresIn'> {
  assignment: ReferenceAssignment;
}

export interface InvitationSettingsInterface {
  email: {
    from: string;
    baseUrl: string;
    templates: {
      invitation: {
        fileName: string;
        subject: string;
      };
      invitationAccepted: {
        fileName: string;
        subject: string;
      };
    };
  };
  otp: InvitationOtpSettingsInterface;
}
