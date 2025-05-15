import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

import {
  ORG_MODULE_ORG_MEMBER_ENTITY_KEY,
  ORG_MODULE_ORG_ENTITY_KEY,
  ORG_MODULE_ORG_PROFILE_ENTITY_KEY,
} from '../org.constants';
import { OrgEntityInterface } from '@concepta/nestjs-common';
import { OrgMemberEntityInterface } from '@concepta/nestjs-common';
import { OrgProfileEntityInterface } from '@concepta/nestjs-common';

export interface OrgEntitiesOptionsInterface {
  entities: {
    [ORG_MODULE_ORG_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<OrgEntityInterface>;
    [ORG_MODULE_ORG_MEMBER_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<OrgMemberEntityInterface>;
    [ORG_MODULE_ORG_PROFILE_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<OrgProfileEntityInterface>;
  };
}
