import {
  ByIdInterface,
  CreateOneInterface,
  ReferenceId,
  RemoveOneInterface,
} from '@concepta/nestjs-common';

import { OrgMemberEntityInterface } from './org-member-entity.interface';
import { OrgMemberCreatableInterface } from './org-member-creatable.interface';

export interface OrgMemberModelServiceInterface
  extends ByIdInterface<ReferenceId, OrgMemberEntityInterface>,
    CreateOneInterface<OrgMemberCreatableInterface, OrgMemberEntityInterface>,
    RemoveOneInterface<
      Pick<OrgMemberEntityInterface, 'id'>,
      OrgMemberEntityInterface
    > {}
