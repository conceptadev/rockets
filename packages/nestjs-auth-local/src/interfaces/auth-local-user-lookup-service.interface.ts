import { IdentityUsernameInterface } from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from './auth-local-credentials.interface';

export interface AuthLocalUserLookupServiceInterface {
  getByUsername(
    username: IdentityUsernameInterface['username'],
  ): Promise<AuthLocalCredentialsInterface>;
}
