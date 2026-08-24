import { RocketsAuthUserOtpSettingsInterface } from '../../domains/otp/interfaces/rockets-auth-user-otp-settings.interface';

export interface RocketsAuthSettingsInterface {
  role: {
    adminRoleName: string;
    defaultUserRoleName?: string;
  };
  email: {
    from: string;
    baseUrl: string;
    tokenUrlFormatter?: (baseUrl: string, passcode: string) => string;
    templates: {
      sendOtp: {
        fileName: string;
        subject: string;
      };
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
  otp: RocketsAuthUserOtpSettingsInterface;
}
