import { Injectable } from '@nestjs/common';
import { ReferenceSubject, ReferenceUsername } from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { AuthLocalUserLookupServiceInterface } from '../../interfaces/auth-local-user-lookup-service.interface';
import { LOGIN_SUCCESS, USER_SUCCESS } from './constants';

@Injectable()
export class UserLookupServiceFixture
  implements AuthLocalUserLookupServiceInterface
{
  async byUsername(
    username: ReferenceUsername,
  ): Promise<AuthLocalCredentialsInterface | null> {
    if (LOGIN_SUCCESS.username === username) return USER_SUCCESS;
    else return null;
  }

  async bySubject(
    subject: ReferenceSubject,
  ): Promise<AuthLocalCredentialsInterface | null> {
    throw new Error(`Method not implemented, can't get ${subject}.`);
  }
}
