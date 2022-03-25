import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { FederatedServiceInterface } from '../interfaces/federated-service.interface';
import { FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN } from '../federated.constants';
import { Federated } from '../entities/federated.entity';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedCreatableInterface } from '../interfaces/federated-creatable.interface';

@Injectable()
export class FederatedService implements FederatedServiceInterface
{
  constructor(
    @Inject(FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN)
    public federatedRepo: Repository<Federated>,
  ) {}

  async exists(provider: string, federatedRef: string): Promise<FederatedEntityInterface> {
    const federated = await this.federatedRepo.findOne({
      where: {
        provider,
        federatedRef,
      },
    });

    if (!federated) return null;

    return federated;
  }

  async create(federatedDto: FederatedCreatableInterface): Promise<FederatedEntityInterface> {
    const federated = await this.federatedRepo.create(federatedDto);

    if (!federated) return null;

    return federated;
  }
  
}
