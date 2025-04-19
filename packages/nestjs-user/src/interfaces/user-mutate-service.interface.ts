import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

import { UserEntityInterface } from './user-entity.interface';

/**
 * @deprecated - will be removed after model service refactor
 */
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
    RemoveOneInterface<UserEntityInterface, UserEntityInterface> {}
