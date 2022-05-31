import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { FederatedEntityInterface } from './federated-entity.interface';
import { FederatedCreatableInterface } from './federated-creatable.interface';
import { FederatedUpdatableInterface } from './federated-updatable.interface';

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
