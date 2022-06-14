import { Entity, ManyToOne } from 'typeorm';
import { OtpAssignmentSqliteEntity } from '../../entities/otp-assignment-sqlite.entity';
import { OtpAssigneeInterface } from '../../interfaces/otp-assignee.interface';
import { UserEntityFixture } from './user-entity.fixture';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpAssignmentSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee: OtpAssigneeInterface;
}
