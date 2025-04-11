import {
  ReferenceUsername,
  ByUsernameInterface,
} from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface
  extends ByUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface
  > {}
