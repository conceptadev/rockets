import { Injectable } from '@nestjs/common';
import {
  ReferenceEmail,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

import { AuthRecoveryUserModelServiceInterface } from '../../../interfaces/auth-recovery-user-model.service.interface';

import { UserFixture } from '../user.fixture';

@Injectable()
export class UserModelServiceFixture
  implements AuthRecoveryUserModelServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<AuthRecoveryUserModelServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<AuthRecoveryUserModelServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }

  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, can't get ${subject}.`);
  }
}
