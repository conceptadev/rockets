import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceId,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Postgres Entity
 */
export abstract class RolePostgresEntity implements RoleEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  /**
   * Name
   */
  @Column()
  name!: string;

  /**
   * Description
   */
  @Column()
  description!: string;

  /**
   * Audit embed
   */
  @Column(() => AuditPostgresEmbed, {})
  audit!: AuditInterface;

  /**
   * Assignees
   *
   * You will need to decorate this in your concrete entity class.
   */
  assignees!: ReferenceAssigneeInterface[];
}
