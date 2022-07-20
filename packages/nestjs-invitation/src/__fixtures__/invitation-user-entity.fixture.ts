import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { InvitationUserOtpEntityFixture } from './invitation-user-otp-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class InvitationUserEntityFixture extends UserSqliteEntity {
  @OneToMany(
    () => InvitationUserOtpEntityFixture,
    (userOtp) => userOtp.assignee,
  )
  userOtps?: InvitationUserOtpEntityFixture[];
}
