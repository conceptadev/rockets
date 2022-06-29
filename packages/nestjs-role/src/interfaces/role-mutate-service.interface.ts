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

export interface RoleMutateServiceInterface
  extends CreateOneInterface<RoleCreatableInterface, RoleEntityInterface>,
    UpdateOneInterface<
      RoleUpdatableInterface & ReferenceIdInterface,
      RoleEntityInterface
    >,
    ReplaceOneInterface<
      RoleCreatableInterface & ReferenceIdInterface,
      RoleEntityInterface
    >,
    RemoveOneInterface<RoleEntityInterface> {}
