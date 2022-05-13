import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
} from '@concepta/ts-core';

export interface UserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface,
    LookupSubjectInterface,
    LookupUsernameInterface {}
