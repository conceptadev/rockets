import { RoleAssignableInterface } from './role-assignable.interface';
import { RoleEntityInterface } from './role-entity.interface';

export interface RoleAssignmentInterface extends RoleAssignableInterface {
  /**
   * Role
   */
  role: RoleEntityInterface;
}
