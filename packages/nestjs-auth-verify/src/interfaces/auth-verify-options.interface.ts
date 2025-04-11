import { AuthVerifySettingsInterface } from './auth-verify-settings.interface';
import { AuthVerifyOtpServiceInterface } from './auth-verify-otp.service.interface';
import { AuthVerifyEmailServiceInterface } from './auth-verify-email.service.interface';
import { AuthVerifyNotificationServiceInterface } from './auth-verify-notification.service.interface';
import { AuthVerifyUserLookupServiceInterface } from './auth-verify-user-lookup.service.interface';
import { AuthVerifyUserMutateServiceInterface } from './auth-verify-user-mutate.service.interface';

export interface AuthVerifyOptionsInterface {
  settings?: AuthVerifySettingsInterface;
  otpService: AuthVerifyOtpServiceInterface;
  emailService: AuthVerifyEmailServiceInterface;
  userLookupService: AuthVerifyUserLookupServiceInterface;
  userMutateService: AuthVerifyUserMutateServiceInterface;
  notificationService?: AuthVerifyNotificationServiceInterface;
}
