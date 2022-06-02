import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { RoleTargetInterface } from '../interfaces/role-target.interface';

/**
 * Role Sqlite Entity
 */
@Entity()
export class RoleTargetSqliteEntity implements RoleTargetInterface {
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  targetId: string;

  @Column()
  roleId: string;

  @Column(() => AuditSqlLiteEmbed, {})
  audit: AuditInterface;
}
