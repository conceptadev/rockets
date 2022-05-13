import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { UserCreatableInterface } from './user-creatable.interface';
import { UserUpdatableInterface } from './user-updatable.interface';
import { UserEntityInterface } from './user-entity.interface';

export interface UserMutateServiceInterface
  extends CreateOneInterface<UserCreatableInterface, UserEntityInterface>,
    UpdateOneInterface<
      UserUpdatableInterface & ReferenceIdInterface,
      UserEntityInterface
    >,
    ReplaceOneInterface<
      UserCreatableInterface & ReferenceIdInterface,
      UserEntityInterface
    >,
    RemoveOneInterface<UserEntityInterface> {}
