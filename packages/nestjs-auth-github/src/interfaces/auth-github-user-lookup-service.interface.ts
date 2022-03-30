import {
  LookupEmailInterface,
  LookupReferenceInterface,
  LookupSubjectInterface,
} from '@concepta/nestjs-common';

export interface AuthGithubUserLookupServiceInterface
  extends LookupReferenceInterface,
    LookupEmailInterface,
    LookupSubjectInterface {}
