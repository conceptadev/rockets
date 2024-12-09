import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import {
  FederatedCreatableInterface,
  FederatedUpdatableInterface,
} from '@concepta/nestjs-common';
import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedMutateServiceInterface
  extends CreateOneInterface<
      FederatedCreatableInterface,
      FederatedEntityInterface
    >,
    UpdateOneInterface<
      FederatedUpdatableInterface & ReferenceIdInterface,
      FederatedEntityInterface
    >,
    ReplaceOneInterface<
      FederatedCreatableInterface & ReferenceIdInterface,
      FederatedEntityInterface
    >,
    RemoveOneInterface<FederatedEntityInterface> {}
