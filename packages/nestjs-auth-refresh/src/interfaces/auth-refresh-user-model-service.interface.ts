import {
  BySubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

export interface AuthRefreshUserModelServiceInterface
  extends BySubjectInterface<ReferenceSubject, ReferenceIdInterface> {}
