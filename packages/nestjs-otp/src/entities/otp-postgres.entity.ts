import { Column } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { OtpInterface } from '@concepta/nestjs-common';
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

  @Column({ default: true })
  active!: boolean;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
