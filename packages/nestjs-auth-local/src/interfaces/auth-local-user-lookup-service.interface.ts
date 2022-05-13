import { ReferenceUsername, LookupUsernameInterface } from '@concepta/ts-core';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends LookupUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface
  > {}
