import { Unique } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Assignment Sqlite Entity
 */
@Unique(['role', 'assignee'])
export abstract class RoleAssignmentSqliteEntity
  extends CommonSqliteEntity
  implements RoleAssignmentEntityInterface
{
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
