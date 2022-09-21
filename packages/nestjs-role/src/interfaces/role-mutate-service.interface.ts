import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import {
  RoleCreatableInterface,
  RoleUpdatableInterface,
} from '@concepta/ts-common';
import { RoleEntityInterface } from './role-entity.interface';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface RoleMutateServiceInterface
  extends CreateOneInterface<RoleCreatableInterface, RoleEntityInterface>,
    UpdateOneInterface<
      RoleUpdatableInterface & ReferenceIdInterface,
      RoleEntityInterface,
      QueryOptionsInterface
    >,
    ReplaceOneInterface<
      RoleCreatableInterface & ReferenceIdInterface,
      RoleEntityInterface,
      QueryOptionsInterface
    >,
    RemoveOneInterface<
      RoleEntityInterface,
      RoleEntityInterface,
      QueryOptionsInterface
    > {}
