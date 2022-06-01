import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { ROLE_MODULE_ORG_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from './role-entity.interface';

export interface RoleOrmOptionsInterface {
  entities: {
    [ROLE_MODULE_ORG_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<RoleEntityInterface>;
  };
}
