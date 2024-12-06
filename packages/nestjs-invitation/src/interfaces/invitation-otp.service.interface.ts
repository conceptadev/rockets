import {
  OtpClearInterface,
  OtpCreateInterface,
  OtpValidateInterface,
} from '@concepta/nestjs-common';

export interface InvitationOtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpClearInterface {}
