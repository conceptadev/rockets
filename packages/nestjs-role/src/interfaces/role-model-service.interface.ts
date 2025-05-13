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
  RoleEntityInterface,
} from '@concepta/nestjs-common';

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
