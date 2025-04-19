import { Column, Unique } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';

/**
 * Role Assignment Sqlite Entity
 */
@Unique(['roleId', 'assigneeId'])
export abstract class RoleAssignmentSqliteEntity
  extends CommonSqliteEntity
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
