import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import { UserEntityInterface } from './user-entity.interface';

export interface UserMutateServiceInterface
  extends CreateOneInterface<UserCreatableInterface, UserEntityInterface>,
    UpdateOneInterface<
      UserUpdatableInterface & ReferenceIdInterface,
      UserEntityInterface,
      QueryOptionsInterface
    >,
    ReplaceOneInterface<
      UserCreatableInterface & ReferenceIdInterface,
      UserEntityInterface,
      QueryOptionsInterface
    >,
    RemoveOneInterface<
      UserEntityInterface,
      UserEntityInterface,
      QueryOptionsInterface
    > {}
