import {
  BySubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

export interface AuthRefreshUserLookupServiceInterface
  extends BySubjectInterface<ReferenceSubject, ReferenceIdInterface> {}
