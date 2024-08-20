import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { NotAnErrorException } from '@concepta/ts-core';
import { BaseService, QueryOptionsInterface } from '@concepta/typeorm-common';

import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';

import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedQueryException } from '../exceptions/federated-query.exception';

@Injectable()
export class FederatedService
  extends BaseService<FederatedEntityInterface>
  implements FederatedServiceInterface
{
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    federatedRepo: Repository<FederatedEntityInterface>,
  ) {
    super(federatedRepo);
  }

  async exists(
    provider: string,
    subject: string,
    queryOptions?: QueryOptionsInterface,
  ) {
    try {
      return this.repository(queryOptions).findOne({
        where: {
          provider,
          subject,
        },
        relations: ['user'],
      });
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new FederatedQueryException(this.metadata.name, exception);
    }
  }
}
