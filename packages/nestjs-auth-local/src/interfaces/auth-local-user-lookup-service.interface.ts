import {
  ReferenceUsername,
  LookupUsernameInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends LookupUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface,
    QueryOptionsInterface
  > {}
