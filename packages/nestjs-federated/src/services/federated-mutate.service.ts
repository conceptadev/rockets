import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  FederatedCreatableInterface,
  FederatedUpdatableInterface,
} from '@concepta/ts-common';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedMutateServiceInterface } from '../interfaces/federated-mutate-service.interface';
import { FederatedCreateDto } from '../dto/federated-create.dto';
import { FederatedUpdateDto } from '../dto/federated-update.dto';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';

/**
 * Federated mutate service
 */
@Injectable()
export class FederatedMutateService
  extends MutateService<
    FederatedEntityInterface,
    FederatedCreatableInterface,
    FederatedUpdatableInterface
  >
  implements FederatedMutateServiceInterface
{
  protected createDto = FederatedCreateDto;
  protected updateDto = FederatedUpdateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the federated repo
   */
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    repo: Repository<FederatedEntityInterface>,
  ) {
    super(repo);
  }
}
