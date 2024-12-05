import { Column } from 'typeorm';
import { ReferenceAssigneeInterface } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

/**
 * Role Postgres Entity
 */
export abstract class RolePostgresEntity
  extends CommonPostgresEntity
  implements RoleEntityInterface
{
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
   * Assignees
   *
   * You will need to decorate this in your concrete entity class.
   */
  assignees!: ReferenceAssigneeInterface[];
}
