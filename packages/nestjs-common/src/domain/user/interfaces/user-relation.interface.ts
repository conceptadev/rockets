import { ReferenceId } from '../../../reference/interfaces/reference.types';

/**
 * Belongs to user.
 */
export interface UserRelationInterface<T extends ReferenceId = ReferenceId> {
  userId: T;
}
