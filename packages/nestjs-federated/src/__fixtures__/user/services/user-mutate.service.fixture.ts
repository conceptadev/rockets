import { Injectable } from '@nestjs/common';

import { UserFixture } from '../user.fixture';
import { FederatedUserMutateInterface } from '../../../interfaces/federated-user-mutate.interface';
import { FederatedUserMutateServiceInterface } from '../../../interfaces/federated-user-mutate-service.interface';
import { FederatedCredentialsInterface } from '../../../interfaces/federated-credentials.interface';

@Injectable()
export class UserMutateServiceFixture
  implements FederatedUserMutateServiceInterface
{
  async create(
    _object: FederatedUserMutateInterface,
  ): Promise<FederatedCredentialsInterface> {
    return UserFixture;
  }
}
