import { Entity } from 'typeorm';
import { OrgSqliteEntity } from '../entities/org-sqlite.entity';

/**
 * Org Entity Fixture
 */
@Entity()
export class OrgEntityFixture extends OrgSqliteEntity {}
