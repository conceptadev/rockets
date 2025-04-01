import {
  LookupSubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthJwtUserLookupServiceInterface
  extends LookupSubjectInterface<
    ReferenceSubject,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {}
