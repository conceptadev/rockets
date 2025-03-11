import { ModuleOptionsControllerInterface } from '@concepta/nestjs-common';

import { InvitationEmailServiceInterface } from '../services/invitation-email-service.interface';
import { InvitationOtpServiceInterface } from '../services/invitation-otp-service.interface';
import { InvitationSettingsInterface } from './invitation-settings.interface';
import { InvitationUserLookupServiceInterface } from '../services/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../services/invitation-user-mutate.service.interface';
import { InvitationSendServiceInterface } from '../services/invitation-send-service.interface';

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  otpService: InvitationOtpServiceInterface;
  emailService: InvitationEmailServiceInterface;
  userLookupService: InvitationUserLookupServiceInterface;
  userMutateService: InvitationUserMutateServiceInterface;
  invitationSendService?: InvitationSendServiceInterface;
}
