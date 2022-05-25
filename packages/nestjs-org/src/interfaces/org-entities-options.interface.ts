import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { OrgEntityInterface } from './org-entity.interface';

export interface OrgOrmOptionsInterface {
  entities: {
    org: TypeOrmExtEntityOptionInterface<OrgEntityInterface>;
  };
}
