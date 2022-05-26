import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { FederatedPostgresEntity } from '../entities/federated-postgres.entity';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedCreatableInterface } from '../interfaces/federated-creatable.interface';
import { FederatedCreateException } from '../exceptions/federated-create.exception';
import { FederatedNotFoundException } from '../exceptions/federated-not-found.exception';
@Injectable()
export class FederatedService implements FederatedServiceInterface {
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    private federatedRepo: Repository<FederatedPostgresEntity>,
  ) {}

  async exists(
    provider: string,
    subject: string,
  ): Promise<FederatedEntityInterface> {
    try {
      const federated = await this.federatedRepo.findOne({
        where: {
          provider,
          subject,
        },
      });

      if (!federated) return null;

      return federated;
    } catch (e) {
      throw new FederatedNotFoundException(this.federatedRepo.metadata.name, e);
    }
  }

  async create(
    federatedDto: FederatedCreatableInterface,
  ): Promise<FederatedEntityInterface> {
    try {
      // TODO: need to validate the DTO and throw an exception before trying to save
      const federated = await this.federatedRepo.save(federatedDto);

      if (!federated) return null;

      return federated;
    } catch (e) {
      throw new FederatedCreateException(this.federatedRepo.metadata.name, e);
    }
  }
}
