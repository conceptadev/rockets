import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { InvitationUserOtpEntityFixture } from './invitation-user-otp-entity.fixture';
import { InvitationEntityFixture } from './invitation.entity.fixture';

@Entity()
export class InvitationUserEntityFixture extends UserSqliteEntity {
  @OneToMany(
    () => InvitationUserOtpEntityFixture,
    (userOtp) => userOtp.assignee,
  )
  userOtps?: InvitationUserOtpEntityFixture[];

  @OneToMany(
    () => InvitationEntityFixture,
    (userInvitation) => userInvitation.user,
  )
  invitations?: InvitationEntityFixture[];
}
