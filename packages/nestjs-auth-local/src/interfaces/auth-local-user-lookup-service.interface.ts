import {
  IdentityUsername,
  LookupUsernameInterface,
} from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends LookupUsernameInterface<
    IdentityUsername,
    AuthLocalCredentialsInterface
  > {}
