import { ModuleOptionsControllerInterface } from '@concepta/nestjs-common';

import { InvitationEmailServiceInterface } from './invitation-email.service.interface';
import { InvitationOtpServiceInterface } from './invitation-otp.service.interface';
import { InvitationSettingsInterface } from './invitation-settings.interface';
import { InvitationUserLookupServiceInterface } from './invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from './invitation-user-mutate.service.interface';
import { InvitationSendServiceInterface } from './invitation-send.service.interface';

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  otpService: InvitationOtpServiceInterface;
  emailService: InvitationEmailServiceInterface;
  userLookupService: InvitationUserLookupServiceInterface;
  userMutateService: InvitationUserMutateServiceInterface;
  invitationSendService?: InvitationSendServiceInterface;
}
