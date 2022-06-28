import { Entity, ManyToOne } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserEntityFixture } from './user-entity.fixture';
import { OtpSqliteEntity } from '../../entities/otp-sqlite.entity';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee!: ReferenceIdInterface;
}
