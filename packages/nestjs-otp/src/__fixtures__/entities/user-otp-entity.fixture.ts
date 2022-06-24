import { Entity, ManyToOne } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserEntityFixture } from './user-entity.fixture';
import { OtpAssignmentSqliteEntity } from '../../entities/otp-assignment-sqlite.entity';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpAssignmentSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee!: ReferenceIdInterface;
}
