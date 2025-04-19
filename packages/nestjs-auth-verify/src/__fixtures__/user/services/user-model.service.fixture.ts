import { Injectable } from '@nestjs/common';
import {
  ReferenceActiveInterface,
  ReferenceEmail,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

import { AuthVerifyUserModelServiceInterface } from '../../../interfaces/auth-verify-user-model.service.interface';

import { UserFixture } from '../user.fixture';

@Injectable()
export class UserModelServiceFixture
  implements AuthVerifyUserModelServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<AuthVerifyUserModelServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<AuthVerifyUserModelServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }

  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, can't get ${subject}.`);
  }

  async update(
    object: ReferenceIdInterface<string> & ReferenceActiveInterface,
  ): ReturnType<AuthVerifyUserModelServiceInterface['update']> {
    if (object.id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }
}
