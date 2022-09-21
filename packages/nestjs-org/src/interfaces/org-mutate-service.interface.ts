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
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OrgMutateServiceInterface
  extends CreateOneInterface<OrgCreatableInterface, OrgEntityInterface>,
    UpdateOneInterface<
      OrgUpdatableInterface & ReferenceIdInterface,
      OrgEntityInterface,
      QueryOptionsInterface
    >,
    ReplaceOneInterface<
      OrgCreatableInterface & ReferenceIdInterface,
      OrgEntityInterface,
      QueryOptionsInterface
    >,
    RemoveOneInterface<
      OrgEntityInterface,
      OrgEntityInterface,
      QueryOptionsInterface
    > {}
