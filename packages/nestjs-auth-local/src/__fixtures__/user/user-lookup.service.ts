import { ReferenceUsername } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { AuthLocalUserLookupServiceInterface } from '../../interfaces/auth-local-user-lookup-service.interface';

@Injectable()
export class UserLookupService implements AuthLocalUserLookupServiceInterface {
  async byUsername(
    username: ReferenceUsername,
  ): Promise<AuthLocalCredentialsInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
