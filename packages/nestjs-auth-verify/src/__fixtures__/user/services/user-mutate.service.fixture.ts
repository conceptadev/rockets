import { Injectable } from '@nestjs/common';
import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

import { AuthVerifyUserMutateServiceInterface } from '../../../interfaces/auth-verify-user-mutate.service.interface';

import { UserFixture } from '../user.fixture';

@Injectable()
export class UserMutateServiceFixture
  implements AuthVerifyUserMutateServiceInterface
{
  // ReferenceIdInterface & ReferenceActiveInterface,
  //   ReferenceIdInterface & ReferenceEmailInterface & ReferenceActiveInterface,
  async update(
    object: ReferenceIdInterface<string> & ReferenceActiveInterface,
  ): ReturnType<AuthVerifyUserMutateServiceInterface['update']> {
    if (object.id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }
}
