import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN } from '../federated.constants';
import { FederatedPostgresEntity } from '../entities/federated-postgres.entity';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedCreatableInterface } from '../interfaces/federated-creatable.interface';

@Injectable()
export class FederatedService implements FederatedServiceInterface {
  constructor(
    @Inject(FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN)
    private federatedRepo: Repository<FederatedPostgresEntity>,
  ) {}

  async exists(
    provider: string,
    subject: string,
  ): Promise<FederatedEntityInterface> {
    const federated = await this.federatedRepo.findOne({
      where: {
        provider,
        subject,
      },
    });

    if (!federated) return null;

    return federated;
  }

  async create(
    federatedDto: FederatedCreatableInterface,
  ): Promise<FederatedEntityInterface> {
    // TODO: need to validate the DTO and throw an exception before trying to save
    const federated = await this.federatedRepo.save(federatedDto);

    if (!federated) return null;

    return federated;
  }
}
