import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Postgres Entity
 */
@Entity()
export class RolePostgresEntity implements RoleEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  /**
   * Name
   */
  @Column()
  name: string;

  /**
   * Description
   */
  @Column()
  description: string;

  /**
   * Audit embed
   */
  @Column(() => AuditPostgresEmbed, {})
  audit: AuditInterface;
}
