import { Column, Entity, ManyToOne } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { OtpInterface } from '@concepta/ts-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';

import { UserEntityFixture } from './user-entity.fixture';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture
  extends CommonSqliteEntity
  implements OtpInterface
{
  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'datetime' })
  expirationDate!: Date;

  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee!: ReferenceIdInterface;
}
