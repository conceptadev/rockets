import { ReferenceSubject } from '../../references/reference.types';

/**
 * Identifiable by subject (JWT).
 */
export interface ReferenceSubjectInterface<T = ReferenceSubject> {
  sub: T;
}
