import { Injectable } from '@nestjs/common';
import { ReferenceUsername } from '@concepta/ts-core';
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
}
