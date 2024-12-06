import {
  OtpCreateInterface,
  OtpValidateInterface,
  OtpDeleteInterface,
  OtpClearInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OtpServiceInterface
  extends OtpCreateInterface<QueryOptionsInterface>,
    OtpValidateInterface<QueryOptionsInterface>,
    OtpDeleteInterface<QueryOptionsInterface>,
    OtpClearInterface<QueryOptionsInterface> {}
