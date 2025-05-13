import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from '@concepta/nestjs-common';

export interface RoleEntitiesOptionsInterface {
  entities: {
    [ROLE_MODULE_ROLE_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<RoleEntityInterface>;
  } & Record<string, TypeOrmExtEntityOptionInterface>;
}
