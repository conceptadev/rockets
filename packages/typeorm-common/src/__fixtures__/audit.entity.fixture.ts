import { ReferenceIdInterface } from '@concepta/ts-core';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditSqlLiteEmbed } from '../embeds/audit/audit-sqlite.embed';

@Entity()
export class AuditEntityFixture
  extends AuditSqlLiteEmbed
  implements ReferenceIdInterface
{
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
