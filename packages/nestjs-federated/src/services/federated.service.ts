import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { NotAnErrorException } from '@concepta/ts-core';
import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { FederatedPostgresEntity } from '../entities/federated-postgres.entity';
import { FederatedQueryException } from '../exceptions/federated-query.exception';
@Injectable()
export class FederatedService implements FederatedServiceInterface {
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    private federatedRepo: Repository<FederatedPostgresEntity>,
  ) {}

  async exists(provider: string, subject: string) {
    try {
      return this.federatedRepo.findOne({
        where: {
          provider,
          subject,
        },
      });
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new FederatedQueryException(
        this.federatedRepo.metadata.name,
        exception,
      );
    }
  }
}
