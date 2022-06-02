import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from './role-entity.interface';

export interface RoleEntitiesOptionsInterface {
  entities: {
    [ROLE_MODULE_ROLE_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<RoleEntityInterface>;
  } & Record<string, TypeOrmExtEntityOptionInterface>;
}
