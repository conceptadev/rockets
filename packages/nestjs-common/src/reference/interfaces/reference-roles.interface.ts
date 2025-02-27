import { ReferenceIdInterface } from './reference-id.interface';

/**
 * Identifiable by roles.
 */
export interface ReferenceRolesInterface<T = ReferenceIdInterface> {
  roles: T[];
}
