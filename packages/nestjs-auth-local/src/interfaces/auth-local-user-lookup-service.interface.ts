import {
  ReferenceUsername,
  LookupUsernameInterface,
  ReferenceActiveInterface,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends LookupUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface & ReferenceActiveInterface,
    QueryOptionsInterface
  > {}
