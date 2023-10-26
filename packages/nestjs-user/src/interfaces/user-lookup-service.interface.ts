import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
  ReferenceActiveInterface,
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
      ReferenceIdInterface & ReferenceActiveInterface,
      QueryOptionsInterface
    >,
    LookupSubjectInterface<
      ReferenceSubject,
      ReferenceIdInterface & ReferenceActiveInterface,
      QueryOptionsInterface
    >,
    LookupUsernameInterface<
      ReferenceUsername,
      ReferenceIdInterface & ReferenceActiveInterface,
      QueryOptionsInterface
    > {}
