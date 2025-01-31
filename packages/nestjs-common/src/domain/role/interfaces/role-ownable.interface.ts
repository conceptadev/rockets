import { ReferenceId } from '../../../reference/interfaces/reference.types';
import { RoleInterface } from './role.interface';

export interface RoleOwnableInterface {
  roleId: ReferenceId;
  role: Partial<RoleInterface>;
}
