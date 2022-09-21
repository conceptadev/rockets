import {
  LookupSubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthJwtUserLookupServiceInterface
  extends LookupSubjectInterface<
    ReferenceSubject,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {}
