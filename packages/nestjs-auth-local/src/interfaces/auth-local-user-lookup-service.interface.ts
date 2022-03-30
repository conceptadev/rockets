import {
  ReferenceUsername,
  LookupUsernameInterface,
} from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends LookupUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface
  > {}
