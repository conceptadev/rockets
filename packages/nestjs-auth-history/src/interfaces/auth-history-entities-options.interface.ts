import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY } from '../auth-history.constants';
import { AuthHistoryEntityInterface } from './auth-history-entity.interface';

export interface AuthHistoryEntitiesOptionsInterface {
  entities: {
    [AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<AuthHistoryEntityInterface>;
  };
}
