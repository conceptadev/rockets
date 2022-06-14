import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => UserOtpEntityFixture, (userOtp) => userOtp.assignee)
  userOtps: UserOtpEntityFixture[];
}
