import { UserEntityInterface } from './user-entity.interface';
import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import {
  USER_MODULE_USER_ENTITY_KEY,
  USER_MODULE_USER_PROFILE_ENTITY_KEY,
  USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
} from '../user.constants';
import { UserPasswordHistoryEntityInterface } from './user-password-history-entity.interface';
import { UserProfileEntityInterface } from './user-profile-entity.interface';

export interface UserEntitiesOptionsInterface {
  entities: {
    [USER_MODULE_USER_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<UserEntityInterface>;
    [USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<UserPasswordHistoryEntityInterface>;
    [USER_MODULE_USER_PROFILE_ENTITY_KEY]?: TypeOrmExtEntityOptionInterface<UserProfileEntityInterface>;
  };
}
