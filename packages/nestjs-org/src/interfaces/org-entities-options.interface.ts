import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

import {
  ORG_MODULE_ORG_MEMBER_ENTITY_KEY,
  ORG_MODULE_ORG_ENTITY_KEY,
} from '../org.constants';
import { OrgEntityInterface } from './org-entity.interface';
import { OrgMemberEntityInterface } from './org-member-entity.interface';

export interface OrgEntitiesOptionsInterface {
  entities: {
    [ORG_MODULE_ORG_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<OrgEntityInterface>;
    [ORG_MODULE_ORG_MEMBER_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<OrgMemberEntityInterface>;
  };
}
