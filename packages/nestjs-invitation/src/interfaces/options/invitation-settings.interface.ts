import { InvitationOtpSettingsInterface } from './invitation-otp-settings.interface';

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
