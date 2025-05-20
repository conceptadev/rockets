import {
  ORG_MODULE_ORG_MEMBER_ENTITY_KEY,
  ORG_MODULE_ORG_ENTITY_KEY,
  ORG_MODULE_ORG_PROFILE_ENTITY_KEY,
} from '../org.constants';
import {
  OrgEntityInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';
import { OrgMemberEntityInterface } from '@concepta/nestjs-common';
import { OrgProfileEntityInterface } from '@concepta/nestjs-common';

export interface OrgEntitiesOptionsInterface {
  [ORG_MODULE_ORG_ENTITY_KEY]: RepositoryEntityOptionInterface<OrgEntityInterface>;
  [ORG_MODULE_ORG_MEMBER_ENTITY_KEY]: RepositoryEntityOptionInterface<OrgMemberEntityInterface>;
  [ORG_MODULE_ORG_PROFILE_ENTITY_KEY]?: RepositoryEntityOptionInterface<OrgProfileEntityInterface>;
}
