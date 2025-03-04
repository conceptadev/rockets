import {
  AuthHistoryInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AuthHistoryEntityInterface
  extends ReferenceIdInterface,
    AuthHistoryInterface {}
