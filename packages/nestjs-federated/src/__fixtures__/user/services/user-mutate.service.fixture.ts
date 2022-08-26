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
    object: FederatedUserMutateInterface, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<FederatedCredentialsInterface> {
    return UserFixture;
  }
}
