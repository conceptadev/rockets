import { Column, Unique } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';

/**
 * Role Assignment Postgres Entity
 */
@Unique(['roleId', 'assigneeId'])
export abstract class RoleAssignmentPostgresEntity
  extends CommonPostgresEntity
  implements RoleAssignmentEntityInterface
{
  /**
   * Role ID
   */
  @Column({ type: 'uuid' })
  roleId!: ReferenceId;

  /**
   * Assignee ID
   */
  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
