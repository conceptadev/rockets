import { CreateOneInterface } from '@concepta/nestjs-common';

import { OrgMemberEntityInterface } from './org-member-entity.interface';
import { OrgMemberCreatableInterface } from './org-member-creatable.interface';

export interface OrgMemberMutateServiceInterface
  extends CreateOneInterface<
    OrgMemberCreatableInterface,
    OrgMemberEntityInterface
  > {}
