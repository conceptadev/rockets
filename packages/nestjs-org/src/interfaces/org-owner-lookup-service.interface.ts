import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OrgOwnerLookupServiceInterface
  extends LookupIdInterface<
    ReferenceId,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {}
