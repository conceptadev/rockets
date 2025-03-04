import {
  AuthLocalCredentialsInterface,
  AuthLocalUserLookupServiceInterface,
} from '@concepta/nestjs-auth-local';
import { ReferenceUsername } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { USER_SUCCESS } from '../constants';

@Injectable()
export class UserLookupServiceFixture
  implements AuthLocalUserLookupServiceInterface
{
  async byUsername(
    username: ReferenceUsername,
  ): Promise<AuthLocalCredentialsInterface | null> {
    if (USER_SUCCESS.username === username) return USER_SUCCESS;
    return null;
  }
}
