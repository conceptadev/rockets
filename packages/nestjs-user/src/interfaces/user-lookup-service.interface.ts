import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
} from '@concepta/nestjs-common';

export interface UserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface,
    LookupSubjectInterface,
    LookupUsernameInterface {}
