import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface RoleLookupServiceInterface
  extends LookupIdInterface<
    ReferenceId,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {}
