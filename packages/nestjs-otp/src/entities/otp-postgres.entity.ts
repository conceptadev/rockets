import { Column } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
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

  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
