import { Injectable } from '@nestjs/common';
import { ReferenceEmail } from '@concepta/nestjs-common';

import { InvitationUserLookupServiceInterface } from '../../../interfaces/invitation-user-lookup.service.interface';
import { UserFixture } from '../user.fixture';

@Injectable()
export class UserLookupServiceFixture
  implements InvitationUserLookupServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<InvitationUserLookupServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<InvitationUserLookupServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }
}
