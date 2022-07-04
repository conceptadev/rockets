import {
  OtpCreateInterface,
  OtpValidateInterface,
  OtpDeleteInterface,
  OtpClearInterface,
} from '@concepta/ts-common';

export interface AuthRecoveryOtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpDeleteInterface,
    OtpClearInterface {}
