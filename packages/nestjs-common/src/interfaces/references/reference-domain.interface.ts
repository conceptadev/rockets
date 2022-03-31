import { ReferenceDomain } from '../../references/reference.types';

/**
 * Identifiable by domain.
 */
export interface ReferenceDomainInterface<T = ReferenceDomain> {
  domain: T;
}
