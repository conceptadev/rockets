import { Column } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
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

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
