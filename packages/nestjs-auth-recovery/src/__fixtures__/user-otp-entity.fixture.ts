import { Entity, ManyToOne } from 'typeorm';
import { OtpAssignmentSqliteEntity } from '@concepta/nestjs-otp/dist/entities/otp-assignment-sqlite.entity';
import { OtpAssigneeInterface } from '@concepta/nestjs-otp';
import { UserEntityFixture } from './user.entity.fixture';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpAssignmentSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee!: OtpAssigneeInterface;
}
