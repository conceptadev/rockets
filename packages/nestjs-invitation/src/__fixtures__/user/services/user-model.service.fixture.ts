import { Injectable } from '@nestjs/common';
import {
  ReferenceEmail,
  UserCreatableInterface,
} from '@concepta/nestjs-common';

import { InvitationUserModelServiceInterface } from '../../../interfaces/services/invitation-user-model.service.interface';
import { UserFixture } from '../user.fixture';

@Injectable()
export class UserModelServiceFixture
  implements InvitationUserModelServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<InvitationUserModelServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<InvitationUserModelServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }

  async create(
    _object: UserCreatableInterface,
  ): ReturnType<InvitationUserModelServiceInterface['create']> {
    return UserFixture;
  }
}
