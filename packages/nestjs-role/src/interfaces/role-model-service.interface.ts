import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
  RoleCreatableInterface,
  RoleUpdatableInterface,
  ByIdInterface,
  ReferenceId,
} from '@concepta/nestjs-common';
import { RoleEntityInterface } from './role-entity.interface';

export interface RoleModelServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface>,
    CreateOneInterface<RoleCreatableInterface, RoleEntityInterface>,
    UpdateOneInterface<
      RoleUpdatableInterface & ReferenceIdInterface,
      RoleEntityInterface
    >,
    ReplaceOneInterface<
      RoleCreatableInterface & ReferenceIdInterface,
      RoleEntityInterface
    >,
    RemoveOneInterface<Pick<RoleEntityInterface, 'id'>, RoleEntityInterface> {}
