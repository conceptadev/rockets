import { Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserCreatableInterface } from '@concepta/ts-common';

import { InvitationUserMutateServiceInterface } from '../../../interfaces/invitation-user-mutate.service.interface';
import { UserFixture } from '../user.fixture';

@Injectable()
export class UserMutateServiceFixture
  implements InvitationUserMutateServiceInterface
{
  async create(
    object: UserCreatableInterface, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ReturnType<InvitationUserMutateServiceInterface['create']> {
    return UserFixture;
  }

  async update(
    object: ReferenceIdInterface<string>,
  ): ReturnType<InvitationUserMutateServiceInterface['update']> {
    if (object.id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }
}
