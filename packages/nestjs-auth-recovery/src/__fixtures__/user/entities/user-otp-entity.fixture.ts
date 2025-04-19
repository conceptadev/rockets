import { Column, Entity } from 'typeorm';
import { ReferenceId, OtpInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';

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

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'datetime' })
  expirationDate!: Date;

  @Column()
  assigneeId!: ReferenceId;
}
