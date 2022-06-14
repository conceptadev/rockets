import { Entity, ManyToOne } from 'typeorm';
import { OrgSqliteEntity } from '../entities/org-sqlite.entity';
import { OwnerEntityFixture } from './owner-entity.fixture';

/**
 * Org Entity Fixture
 */
@Entity()
export class OrgEntityFixture extends OrgSqliteEntity {
  @ManyToOne(() => OwnerEntityFixture, (user) => user.orgs, { nullable: false })
  owner!: OwnerEntityFixture;
}
