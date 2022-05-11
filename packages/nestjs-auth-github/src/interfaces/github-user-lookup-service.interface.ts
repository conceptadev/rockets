import {
  LookupUsernameInterface,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { GithubCredentialsInterface } from './github-credentials.interface';

// TODO: since we gonna use federated do we actually need this?
export interface GithubUserLookupServiceInterface
  extends LookupUsernameInterface<
    ReferenceUsername,
    GithubCredentialsInterface
  > {}
