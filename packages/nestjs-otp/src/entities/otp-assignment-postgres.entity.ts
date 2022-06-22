import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { OtpAssignmentInterface } from '../interfaces/otp-assignment.interface';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';

/**
 * Otp Assignment Postgres Entity
 */
export abstract class OtpAssignmentPostgresEntity
  implements OtpAssignmentInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passCode!: string;

  @Column({ type: 'timestamptz' })
  expirationDate!: Date;

  @Column(() => AuditPostgresEmbed, {})
  audit!: AuditInterface;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: OtpAssigneeInterface;
}
