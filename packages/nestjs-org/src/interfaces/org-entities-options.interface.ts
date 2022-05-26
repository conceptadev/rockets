import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { ORG_MODULE_ORG_ENTITY_KEY } from '../org.constants';
import { OrgEntityInterface } from './org-entity.interface';

export interface OrgOrmOptionsInterface {
  entities: {
    [ORG_MODULE_ORG_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<OrgEntityInterface>;
  };
}
