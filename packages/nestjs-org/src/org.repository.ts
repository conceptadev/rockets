import { EntityRepository, Repository } from 'typeorm';
import { OrgEntity } from './entities/org.entity';
import { OrgEntityInterface } from './interfaces/org-entity.interface';

/**
 * Org Repository
 */
@EntityRepository(OrgEntity)
export class OrgRepository extends Repository<OrgEntityInterface> {}
