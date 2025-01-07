import { InvitationOtpSettingsInterface } from './invitation-otp-settings.interface';

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
