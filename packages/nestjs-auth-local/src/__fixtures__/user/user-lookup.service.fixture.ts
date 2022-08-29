import { Injectable } from '@nestjs/common';
import { ReferenceUsername } from '@concepta/ts-core';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { AuthLocalUserLookupServiceInterface } from '../../interfaces/auth-local-user-lookup-service.interface';

@Injectable()
export class UserLookupServiceFixture
  implements AuthLocalUserLookupServiceInterface
{
  async byUsername(
    username: ReferenceUsername,
  ): Promise<AuthLocalCredentialsInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
