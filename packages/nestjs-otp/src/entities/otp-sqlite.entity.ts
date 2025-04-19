import { Column } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { ReferenceId } from '@concepta/nestjs-common';
import { OtpInterface } from '@concepta/nestjs-common';

/**
 * Otp Sqlite Entity
 */
export abstract class OtpSqliteEntity
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

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
