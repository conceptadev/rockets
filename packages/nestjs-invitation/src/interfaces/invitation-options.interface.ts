import { ModuleOptionsControllerInterface } from '@concepta/nestjs-core';

import { InvitationSettingsInterface } from './invitation-settings.interface';
import { InvitationOtpServiceInterface } from './invitation-otp.service.interface';
import { InvitationEmailServiceInterface } from './invitation-email.service.interface';
import { InvitationUserLookupServiceInterface } from './invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from './invitation-user-mutate.service.interface';

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  otpService: InvitationOtpServiceInterface;
  emailService: InvitationEmailServiceInterface;
  userLookupService: InvitationUserLookupServiceInterface;
  userMutateService: InvitationUserMutateServiceInterface;
}
