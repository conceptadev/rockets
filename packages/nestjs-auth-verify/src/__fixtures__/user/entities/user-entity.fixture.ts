import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => UserOtpEntityFixture, (userOtp) => userOtp.assignee)
  userOtps?: UserOtpEntityFixture[];
}
