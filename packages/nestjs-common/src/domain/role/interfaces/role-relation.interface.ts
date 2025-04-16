import { ReferenceId } from '../../../reference/interfaces/reference.types';

/**
 * Belongs to role.
 */
export interface RoleRelationInterface<T extends ReferenceId = ReferenceId> {
  roleId: T;
}
