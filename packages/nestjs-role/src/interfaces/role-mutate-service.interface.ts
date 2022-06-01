import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { RoleEntityInterface } from './role-entity.interface';
import { RoleCreatableInterface } from './role-creatable.interface';
import { RoleUpdatableInterface } from './role-updatable.interface';

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
