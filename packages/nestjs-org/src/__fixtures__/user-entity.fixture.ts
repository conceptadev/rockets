import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';

import { OrgMemberEntityFixture } from './org-member.entity.fixture';
import { InvitationEntityFixture } from './invitation.entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => OrgMemberEntityFixture, (orgMember) => orgMember.org)
  orgMembers!: OrgMemberEntityFixture[];

  @OneToMany(() => InvitationEntityFixture, (invitation) => invitation.user)
  invitations?: InvitationEntityFixture[];
}
