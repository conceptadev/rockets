import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { OrgSqliteEntity } from '../entities/org-sqlite.entity';
import { OwnerEntityFixture } from './owner-entity.fixture';
import { OrgMemberEntityFixture } from './org-member.entity.fixture';
import { OrgProfileEntityFixture } from './org-profile.entity.fixture';

/**
 * Org Entity Fixture
 */
@Entity()
export class OrgEntityFixture extends OrgSqliteEntity {
  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => OwnerEntityFixture, (user) => user.orgs, { nullable: false })
  owner!: OwnerEntityFixture;

  @OneToMany(() => OrgMemberEntityFixture, (orgMember) => orgMember.org)
  orgMembers!: OrgMemberEntityFixture[];

  @OneToOne(() => OrgProfileEntityFixture, (orgProfile) => orgProfile.org)
  orgProfile?: OrgProfileEntityFixture;
}
