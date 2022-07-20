import {
  OtpClearInterface,
  OtpCreateInterface,
  OtpValidateInterface,
} from '@concepta/ts-common';

export interface InvitationOtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpClearInterface {}
