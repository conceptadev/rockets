import {
  OtpClearInterface,
  OtpCreateInterface,
  OtpValidateInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationOtpServiceInterface
  extends OtpCreateInterface<QueryOptionsInterface>,
    OtpValidateInterface<QueryOptionsInterface>,
    OtpClearInterface<QueryOptionsInterface> {}
