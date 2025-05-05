import { RepositoryEntityOptionInterface, UserEntityInterface, UserPasswordHistoryEntityInterface } from '@concepta/nestjs-common';
import {
  USER_MODULE_USER_ENTITY_KEY,
  USER_MODULE_USER_PROFILE_ENTITY_KEY,
  USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
} from '../user.constants';
import { UserProfileEntityInterface } from './user-profile-entity.interface';

export interface UserEntitiesOptionsInterface {
  [USER_MODULE_USER_ENTITY_KEY]: RepositoryEntityOptionInterface<UserEntityInterface>;
  [USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY]?: RepositoryEntityOptionInterface<UserPasswordHistoryEntityInterface>;
  [USER_MODULE_USER_PROFILE_ENTITY_KEY]?: RepositoryEntityOptionInterface<UserProfileEntityInterface>;
}
