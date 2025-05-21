import {
  CreateOneInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
  OrgCreatableInterface,
  OrgUpdatableInterface,
  ByIdInterface,
  ReferenceId,
  OrgReplaceableInterface,
} from '@concepta/nestjs-common';
import { OrgEntityInterface } from '@concepta/nestjs-common';

export interface OrgModelServiceInterface
  extends ByIdInterface<ReferenceId, OrgEntityInterface>,
    CreateOneInterface<OrgCreatableInterface, OrgEntityInterface>,
    UpdateOneInterface<OrgUpdatableInterface, OrgEntityInterface>,
    ReplaceOneInterface<OrgReplaceableInterface, OrgEntityInterface>,
    RemoveOneInterface<Pick<OrgEntityInterface, 'id'>, OrgEntityInterface> {}
