import {
  ByEmailInterface,
  ByIdInterface,
  BySubjectInterface,
  ByUsernameInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/nestjs-common';

export interface UserLookupServiceInterface
  extends ByIdInterface,
    ByEmailInterface<ReferenceId, ReferenceIdInterface>,
    BySubjectInterface<ReferenceSubject, ReferenceIdInterface>,
    ByUsernameInterface<ReferenceUsername, ReferenceIdInterface> {}
