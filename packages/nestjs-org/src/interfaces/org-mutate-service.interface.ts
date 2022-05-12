import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { OrgEntityInterface } from './org-entity.interface';
import { OrgCreatableInterface } from './org-creatable.interface';
import { OrgUpdatableInterface } from './org-updatable.interface';

export interface OrgMutateServiceInterface
  extends CreateOneInterface<OrgCreatableInterface, OrgEntityInterface>,
    UpdateOneInterface<
      OrgUpdatableInterface & ReferenceIdInterface,
      OrgEntityInterface
    >,
    ReplaceOneInterface<
      OrgCreatableInterface & ReferenceIdInterface,
      OrgEntityInterface
    >,
    RemoveOneInterface<OrgEntityInterface> {}
