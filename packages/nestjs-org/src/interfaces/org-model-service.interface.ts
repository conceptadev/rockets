import {
  CreateOneInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
  OrgCreatableInterface,
  OrgUpdatableInterface,
  ReferenceIdInterface,
  ByIdInterface,
  ReferenceId,
  OrgOwnerInterface,
  OrgReplaceableInterface,
} from '@concepta/nestjs-common';
import { OrgEntityInterface } from './org-entity.interface';

export interface OrgModelServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface>,
    CreateOneInterface<OrgCreatableInterface, OrgEntityInterface>,
    UpdateOneInterface<OrgUpdatableInterface, OrgEntityInterface>,
    ReplaceOneInterface<OrgReplaceableInterface, OrgEntityInterface>,
    RemoveOneInterface<Pick<OrgEntityInterface, 'id'>, OrgEntityInterface> {
  getOwner(org: OrgOwnerInterface): Promise<ReferenceIdInterface | null>;
}
