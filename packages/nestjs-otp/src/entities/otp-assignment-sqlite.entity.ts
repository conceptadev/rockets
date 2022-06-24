import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpInterface } from '../interfaces/otp.interface';

/**
 * Otp Assignment Sqlite Entity
 */
export abstract class OtpAssignmentSqliteEntity implements OtpInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'datetime' })
  expirationDate!: Date;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
