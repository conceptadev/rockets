import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceId,
} from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Sqlite Entity
 */
export abstract class RoleSqliteEntity implements RoleEntityInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  assignees!: ReferenceAssigneeInterface[];
}
