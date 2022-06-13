import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Sqlite Entity
 */
export abstract class OrgSqliteEntity implements OrgEntityInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  name!: string;

  @Column('boolean', { default: true })
  active = true;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  owner!: ReferenceIdInterface;
}
