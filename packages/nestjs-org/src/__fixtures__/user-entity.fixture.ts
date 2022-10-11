import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';

import { OrgMemberEntityFixture } from './org-member.entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => OrgMemberEntityFixture, (orgMember) => orgMember.org)
  orgMembers!: OrgMemberEntityFixture[];
}
