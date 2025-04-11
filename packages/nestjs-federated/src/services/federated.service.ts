import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { NotAnErrorException } from '@concepta/nestjs-common';
import { RepositoryInterface } from '@concepta/typeorm-common';

import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';

import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedQueryException } from '../exceptions/federated-query.exception';
import {} from '@concepta/typeorm-common';

@Injectable()
export class FederatedService implements FederatedServiceInterface {
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    protected readonly repo: RepositoryInterface<FederatedEntityInterface>,
  ) {}

  async exists(provider: string, subject: string) {
    try {
      return this.repo.findOne({
        where: {
          provider,
          subject,
        },
        relations: ['user'],
      });
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new FederatedQueryException(this.repo.metadata.name, exception);
    }
  }
}
