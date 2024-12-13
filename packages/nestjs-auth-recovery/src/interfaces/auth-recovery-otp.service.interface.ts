import {
  OtpClearInterface,
  OtpCreateInterface,
  OtpValidateInterface,
} from '@concepta/nestjs-common';

export interface AuthRecoveryOtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpClearInterface {}
