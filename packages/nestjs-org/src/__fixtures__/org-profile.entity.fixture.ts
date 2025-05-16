import { Column, Entity, OneToOne } from 'typeorm';

import { OrgProfileSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { OrgEntityFixture } from './org-entity.fixture';

/**
 * Org Profile Entity Fixture
 */
@Entity()
export class OrgProfileEntityFixture extends OrgProfileSqliteEntity {
  @OneToOne(() => OrgEntityFixture, (org) => org.orgProfile)
  org!: OrgEntityFixture;

  @Column({ nullable: true })
  name!: string;
}
