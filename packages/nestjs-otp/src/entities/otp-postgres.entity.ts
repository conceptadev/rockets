import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpInterface } from '@concepta/ts-common';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';

/**
 * Otp Postgres Entity
 */
export abstract class OtpPostgresEntity implements OtpInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'timestamptz' })
  expirationDate!: Date;

  @Column(() => AuditPostgresEmbed, {})
  audit!: AuditInterface;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
