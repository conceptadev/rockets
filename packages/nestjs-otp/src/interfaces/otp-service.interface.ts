import {
  OtpCreateInterface,
  OtpValidateInterface,
  OtpDeleteInterface,
  OtpClearInterface,
} from '@concepta/nestjs-common';

export interface OtpServiceInterface
  extends OtpCreateInterface,
    OtpValidateInterface,
    OtpDeleteInterface,
    OtpClearInterface {}
