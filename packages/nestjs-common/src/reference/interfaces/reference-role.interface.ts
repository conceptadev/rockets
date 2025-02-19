import { ReferenceIdInterface } from './reference-id.interface';

/**
 * Identifiable by role.
 */
export interface ReferenceRoleInterface<T = ReferenceIdInterface> {
  role: T;
}
