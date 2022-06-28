import {
  OtpCreateInterface,
  OtpValidateInterface,
  OtpDeleteInterface,
  OtpClearInterface,
} from '@concepta/ts-common';

export interface OtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpDeleteInterface,
    OtpClearInterface {}
