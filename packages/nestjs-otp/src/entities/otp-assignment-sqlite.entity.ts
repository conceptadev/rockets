import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { OtpAssignmentInterface } from '../interfaces/otp-assignment.interface';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';

/**
 * Otp Assignment Sqlite Entity
 */
export abstract class OtpAssignmentSqliteEntity
  implements OtpAssignmentInterface
{
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
  assignee!: OtpAssigneeInterface;
}
