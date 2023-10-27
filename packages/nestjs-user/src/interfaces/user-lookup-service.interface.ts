import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/ts-core';
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
