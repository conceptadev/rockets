import { Injectable } from '@nestjs/common';
import { ReferenceSubject, ReferenceUsername } from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { AuthLocalUserModelServiceInterface } from '../../interfaces/auth-local-user-model-service.interface';
import { LOGIN_SUCCESS, USER_SUCCESS } from './constants';

@Injectable()
export class UserModelServiceFixture
  implements AuthLocalUserModelServiceInterface
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
