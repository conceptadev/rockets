import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import {
  OrgCreatableInterface,
  OrgUpdatableInterface,
} from '@concepta/ts-common';
import { OrgEntityInterface } from './org-entity.interface';

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
