import { AuthRecoverySettingsInterface } from './auth-recovery-settings.interface';
import { AuthRecoveryOtpServiceInterface } from './auth-recovery-otp.service.interface';
import { AuthRecoveryEmailServiceInterface } from './auth-recovery-email.service.interface';
import { AuthRecoveryNotificationServiceInterface } from './auth-recovery-notification.service.interface';
import { AuthRecoveryUserModelServiceInterface } from './auth-recovery-user-model.service.interface';
import { UserPasswordServiceInterface } from '@concepta/nestjs-user';

export interface AuthRecoveryOptionsInterface {
  settings?: AuthRecoverySettingsInterface;
  otpService: AuthRecoveryOtpServiceInterface;
  emailService: AuthRecoveryEmailServiceInterface;
  userModelService: AuthRecoveryUserModelServiceInterface;
  userPasswordService: UserPasswordServiceInterface;
  notificationService?: AuthRecoveryNotificationServiceInterface;
}
