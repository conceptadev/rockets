import { ModuleOptionsControllerInterface } from '@concepta/nestjs-common';

import { InvitationEmailServiceInterface } from '../services/invitation-email-service.interface';
import { InvitationOtpServiceInterface } from '../services/invitation-otp-service.interface';
import { InvitationSettingsInterface } from './invitation-settings.interface';
import { InvitationUserModelServiceInterface } from '../services/invitation-user-model.service.interface';
import { InvitationSendServiceInterface } from '../services/invitation-send-service.interface';

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  otpService: InvitationOtpServiceInterface;
  emailService: InvitationEmailServiceInterface;
  userModelService: InvitationUserModelServiceInterface;
  invitationSendService?: InvitationSendServiceInterface;
}
