import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import {
  RoleCreatableInterface,
  RoleUpdatableInterface,
} from '@concepta/nestjs-common';
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
    RemoveOneInterface<RoleEntityInterface, RoleEntityInterface> {}
