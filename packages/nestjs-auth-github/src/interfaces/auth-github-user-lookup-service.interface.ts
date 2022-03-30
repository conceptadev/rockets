import {
  LookupEmailInterface,
  LookupIdInterface,
  LookupSubjectInterface,
} from '@concepta/nestjs-common';

export interface AuthGithubUserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface,
    LookupSubjectInterface {}
