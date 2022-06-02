import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import {
  API_KEY_ROLE_MODULE_ORG_ENTITY_KEY,
  ORG_MEMBER_ROLE_MODULE_ORG_ENTITY_KEY,
  ROLE_MODULE_ORG_ENTITY_KEY,
  USER_ROLE_MODULE_ORG_ENTITY_KEY,
} from '../role.constants';
import { RoleEntityInterface } from './role-entity.interface';
import { RoleTargetInterface } from './role-target.interface';
export interface RoleOrmOptionsInterface {
  entities: {
    [ROLE_MODULE_ORG_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<RoleEntityInterface>;
    [USER_ROLE_MODULE_ORG_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<RoleTargetInterface>;
    [API_KEY_ROLE_MODULE_ORG_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<RoleTargetInterface>;
    [ORG_MEMBER_ROLE_MODULE_ORG_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<RoleTargetInterface>;
  };
}
