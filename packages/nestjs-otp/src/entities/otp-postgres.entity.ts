import { Column } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { OtpInterface } from '@concepta/ts-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';

/**
 * Otp Postgres Entity
 */
export abstract class OtpPostgresEntity
  extends CommonPostgresEntity
  implements OtpInterface
{
  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'timestamptz' })
  expirationDate!: Date;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
