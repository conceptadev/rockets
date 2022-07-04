import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class AuthRecoveryUserEntityFixture extends UserSqliteEntity {
  @OneToMany(
    () => AuthRecoveryUserOtpEntityFixture,
    (userOtp) => userOtp.assignee,
  )
  userOtps!: AuthRecoveryUserOtpEntityFixture[];
}
