import { Entity, OneToOne } from 'typeorm';

import { OrgProfileSqliteEntity } from '../entities/org-profile-sqlite.entity';
import { OrgEntityFixture } from './org-entity.fixture';

/**
 * Org Profile Entity Fixture
 */
@Entity()
export class OrgProfileEntityFixture extends OrgProfileSqliteEntity {
  @OneToOne(() => OrgEntityFixture, (org) => org.orgProfile)
  org!: OrgEntityFixture;
}
