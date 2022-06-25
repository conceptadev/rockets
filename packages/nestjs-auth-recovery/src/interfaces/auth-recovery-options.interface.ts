import { OptionsInterface } from '@concepta/ts-core';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { AuthRecoverySettingsInterface } from './auth-recovery-settings.interface';
import { OtpServiceInterface } from './otp-service.interface';
import { EmailServiceInterface } from './email-service.interface';
import { AuthRecoveryUserLookupServiceInterface } from './auth-recovery-user-lookup-service.interface';
import { AuthRecoveryUserMutateServiceInterface } from './auth-recovery-user-mutate-service.interface';

export interface AuthRecoveryOptionsInterface
  extends OptionsInterface,
    ModuleOptionsSettingsInterface {
  settings?: AuthRecoverySettingsInterface;
  otpService: OtpServiceInterface;
  emailService: EmailServiceInterface;
  userLookupService: AuthRecoveryUserLookupServiceInterface;
  userMutateService: AuthRecoveryUserMutateServiceInterface;
}
