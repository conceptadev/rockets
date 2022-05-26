import { UserEntityInterface } from './user-entity.interface';
import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { USER_MODULE_USER_ENTITY_KEY } from '../user.constants';

export interface UserEntitiesOptionsInterface {
  entities: {
    [USER_MODULE_USER_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<UserEntityInterface>;
  };
}
