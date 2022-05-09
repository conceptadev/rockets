import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { OrgInterface } from './org.interface';
import { OrgCreatableInterface } from './org-creatable.interface';
import { OrgUpdatableInterface } from './org-updatable.interface';

export interface OrgMutateServiceInterface
  extends CreateOneInterface<OrgCreatableInterface, OrgInterface>,
    UpdateOneInterface<
      ReferenceIdInterface & OrgUpdatableInterface,
      OrgInterface
    >,
    ReplaceOneInterface<
      ReferenceIdInterface & OrgCreatableInterface,
      OrgInterface
    >,
    RemoveOneInterface<ReferenceIdInterface, OrgInterface> {}
