import { Injectable } from '@nestjs/common';
import { ModelService, RepositoryInterface } from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  FederatedCreatableInterface,
  FederatedUpdatableInterface,
} from '@concepta/nestjs-common';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedModelServiceInterface } from '../interfaces/federated-model-service.interface';
import { FederatedCreateDto } from '../dto/federated-create.dto';
import { FederatedUpdateDto } from '../dto/federated-update.dto';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';

/**
 * Federated model service
 */
@Injectable()
export class FederatedModelService
  extends ModelService<
    FederatedEntityInterface,
    FederatedCreatableInterface,
    FederatedUpdatableInterface
  >
  implements FederatedModelServiceInterface
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
    repo: RepositoryInterface<FederatedEntityInterface>,
  ) {
    super(repo);
  }
}
