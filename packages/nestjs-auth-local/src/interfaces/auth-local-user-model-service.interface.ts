import {
  ReferenceUsername,
  ByUsernameInterface,
} from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserModelServiceInterface
  extends ByUsernameInterface<
    ReferenceUsername,
    AuthLocalCredentialsInterface
  > {}
