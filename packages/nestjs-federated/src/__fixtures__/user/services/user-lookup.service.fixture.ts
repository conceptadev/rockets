import { Injectable } from '@nestjs/common';
import { ReferenceEmail } from '@concepta/nestjs-common';

import { UserFixture } from '../user.fixture';
import { FederatedUserLookupServiceInterface } from '../../../interfaces/federated-user-lookup-service.interface';

@Injectable()
export class UserLookupServiceFixture
  implements FederatedUserLookupServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<FederatedUserLookupServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<FederatedUserLookupServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }
}
