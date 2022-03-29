import {
  LookupEmailInterface,
  LookupReferenceInterface,
  LookupSubjectInterface,
  LookupUsernameInterface,
} from '@concepta/nestjs-common';

export interface UserLookupServiceInterface
  extends LookupReferenceInterface,
    LookupEmailInterface,
    LookupSubjectInterface,
    LookupUsernameInterface {}
