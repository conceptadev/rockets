import {
  OtpCreateInterface,
  OtpValidateInterface,
  OtpDeleteInterface,
  OtpClearInterface,
} from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OtpServiceInterface
  extends OtpCreateInterface<QueryOptionsInterface>,
    OtpValidateInterface<QueryOptionsInterface>,
    OtpDeleteInterface<QueryOptionsInterface>,
    OtpClearInterface<QueryOptionsInterface> {}
