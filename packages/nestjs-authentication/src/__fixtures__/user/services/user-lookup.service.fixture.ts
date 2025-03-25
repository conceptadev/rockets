import { Injectable } from '@nestjs/common';
import {
  ReferenceEmail,
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';

import { AuthVerifyUserLookupServiceInterface } from '../../../verify/interfaces/auth-verify-user-lookup.service.interface';

import { UserFixture } from '../user.fixture';

@Injectable()
export class UserLookupServiceFixture
  implements AuthVerifyUserLookupServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<AuthVerifyUserLookupServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<AuthVerifyUserLookupServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }

  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, can't get ${subject}.`);
  }
}
