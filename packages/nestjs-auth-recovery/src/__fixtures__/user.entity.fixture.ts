import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';
import { UserSqliteEntity } from '@concepta/nestjs-user';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture
  extends UserSqliteEntity
  implements ReferenceIdInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isActive!: boolean;

  @OneToMany(() => UserOtpEntityFixture, (userOtp) => userOtp.assignee)
  userOtps!: UserOtpEntityFixture[];
}
