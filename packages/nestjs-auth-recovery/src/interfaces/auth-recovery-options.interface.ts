import { OptionsInterface } from '@concepta/ts-core';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { AuthRecoverySettingsInterface } from './auth-recovery-settings.interface';
import { OtpServiceInterface } from './otp-service.interface';
import { EmailMailerServiceInterface } from './email-mailer-service.interface';
import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';

export interface AuthRecoveryOptionsInterface
  extends OptionsInterface,
    ModuleOptionsSettingsInterface {
  settings?: AuthRecoverySettingsInterface;
  otpService: OtpServiceInterface;
  emailService: EmailMailerServiceInterface;
  userLookupService: UserLookupServiceInterface;
  userMutateService: UserMutateServiceInterface;
}
