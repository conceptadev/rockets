import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OrgMemberLookupServiceInterface
  extends LookupIdInterface<
    ReferenceId,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {}
