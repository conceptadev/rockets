import {
  BySubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

export interface AuthJwtUserLookupServiceInterface
  extends BySubjectInterface<ReferenceSubject, ReferenceIdInterface> {}
