import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Sqlite Entity
 */
@Entity()
export class OrgSqliteEntity implements OrgEntityInterface {
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  @Column()
  name: string;

  @Column('boolean', { default: true })
  active = true;

  @Column({ nullable: true })
  ownerUserId?: string;

  @Column(() => AuditSqlLiteEmbed, {})
  audit: AuditInterface;
}
