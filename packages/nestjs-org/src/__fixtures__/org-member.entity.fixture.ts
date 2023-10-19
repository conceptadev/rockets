import { Entity, ManyToOne } from 'typeorm';

import { UserEntityFixture } from './user-entity.fixture';
import { OrgEntityFixture } from './org-entity.fixture';
import { OrgMemberSqliteEntity } from '../entities/org-member-sqlite.entity';

@Entity()
export class OrgMemberEntityFixture extends OrgMemberSqliteEntity {
  @ManyToOne(() => OrgEntityFixture, (org) => org.orgMembers, {
    nullable: false,
  })
  org!: OrgEntityFixture;

  @ManyToOne(() => UserEntityFixture, (user) => user.orgMembers, {
    nullable: false,
  })
  user!: UserEntityFixture;
}
