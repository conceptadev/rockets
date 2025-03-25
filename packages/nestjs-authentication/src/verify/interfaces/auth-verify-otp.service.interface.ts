import {
  OtpClearInterface,
  OtpCreateInterface,
  OtpValidateInterface,
} from '@concepta/nestjs-common';

export interface AuthVerifyOtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpClearInterface {}
