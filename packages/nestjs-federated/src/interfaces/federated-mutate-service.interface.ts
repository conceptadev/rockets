import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import {
  FederatedCreatableInterface,
  FederatedUpdatableInterface,
} from '@concepta/ts-common';
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
