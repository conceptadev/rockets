import { Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Assignment Postgres Entity
 */
@Unique(['role', 'assignee'])
export abstract class RoleAssignmentPostgresEntity
  implements RoleAssignmentEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditPostgresEmbed, {})
  audit!: AuditInterface;

  /**
   * Role
   *
   * You will need to decorate this in your concrete entity class
   */
  role!: RoleEntityInterface;

  /**
   * Assignee
   *
   * You will need to decorate this in your concrete entity class
   */
  assignee!: ReferenceIdInterface;
}
