import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface UserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface<
      ReferenceId,
      ReferenceIdInterface,
      QueryOptionsInterface
    >,
    LookupSubjectInterface<
      ReferenceSubject,
      ReferenceIdInterface,
      QueryOptionsInterface
    >,
    LookupUsernameInterface<
      ReferenceUsername,
      ReferenceIdInterface,
      QueryOptionsInterface
    > {}
