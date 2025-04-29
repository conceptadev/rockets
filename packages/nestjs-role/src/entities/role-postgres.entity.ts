import { Column } from 'typeorm';
import { CommonPostgresEntity } from '@concepta/nestjs-typeorm-ext';
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
}
