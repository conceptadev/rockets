import { Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Assignment Sqlite Entity
 */
@Unique(['role', 'assignee'])
export abstract class RoleAssignmentSqliteEntity
  implements RoleAssignmentEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditSqlLiteEmbed, {})
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
