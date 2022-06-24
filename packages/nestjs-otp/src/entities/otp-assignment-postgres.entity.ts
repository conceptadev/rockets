import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { OtpInterface } from '../interfaces/otp.interface';

/**
 * Otp Assignment Postgres Entity
 */
export abstract class OtpAssignmentPostgresEntity implements OtpInterface {
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
