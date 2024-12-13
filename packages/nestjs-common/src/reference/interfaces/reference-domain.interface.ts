import { ReferenceDomain } from './reference.types';

/**
 * Identifiable by domain.
 */
export interface ReferenceDomainInterface<T = ReferenceDomain> {
  domain: T;
}
