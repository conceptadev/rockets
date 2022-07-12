import {
  ModuleOptionsControllerInterface,
  ModuleOptionsSettingsInterface,
} from '@concepta/nestjs-core';
import { AuthRecoverySettingsInterface } from './auth-recovery-settings.interface';
import { AuthRecoveryOtpServiceInterface } from './auth-recovery-otp.service.interface';
import { AuthRecoveryEmailServiceInterface } from './auth-recovery-email.service.interface';
import { AuthRecoveryUserLookupServiceInterface } from './auth-recovery-user-lookup.service.interface';
import { AuthRecoveryUserMutateServiceInterface } from './auth-recovery-user-mutate.service.interface';

export interface AuthRecoveryOptionsInterface
  extends ModuleOptionsSettingsInterface<
      Partial<AuthRecoverySettingsInterface>
    >,
    ModuleOptionsControllerInterface {
  settings?: Partial<AuthRecoverySettingsInterface>;
  otpService: AuthRecoveryOtpServiceInterface;
  emailService: AuthRecoveryEmailServiceInterface;
  userLookupService: AuthRecoveryUserLookupServiceInterface;
  userMutateService: AuthRecoveryUserMutateServiceInterface;
}
