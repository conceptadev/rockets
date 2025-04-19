import {
  BySubjectInterface,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

export interface AuthJwtUserModelServiceInterface
  extends BySubjectInterface<ReferenceSubject, ReferenceIdInterface> {}
