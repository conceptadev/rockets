import { Injectable } from '@nestjs/common';
import {
  ReferenceEmail,
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

import { UserFixture } from '../user.fixture';
import { FederatedUserModelServiceInterface } from '../../../interfaces/federated-user-model-service.interface';
import { FederatedCredentialsInterface } from '../../../interfaces/federated-credentials.interface';

@Injectable()
export class UserModelServiceFixture
  implements FederatedUserModelServiceInterface
{
  async byId(
    id: string,
  ): ReturnType<FederatedUserModelServiceInterface['byId']> {
    if (id === UserFixture.id) {
      return UserFixture;
    } else {
      throw new Error();
    }
  }

  async byEmail(
    email: ReferenceEmail,
  ): ReturnType<FederatedUserModelServiceInterface['byEmail']> {
    return email === UserFixture.email ? UserFixture : null;
  }

  async create(
    _object: ReferenceEmailInterface & ReferenceUsernameInterface,
  ): Promise<FederatedCredentialsInterface> {
    return UserFixture;
  }
}
