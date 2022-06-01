import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Sqlite Entity
 */
@Entity()
export class RoleSqliteEntity implements RoleEntityInterface {
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column(() => AuditSqlLiteEmbed, {})
  audit: AuditInterface;
}
