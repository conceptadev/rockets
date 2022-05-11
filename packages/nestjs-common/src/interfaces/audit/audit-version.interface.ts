import { AuditVersion } from '../../audit/audit.types';

/**
 * The latest version of the data.
 */
export interface AuditVersionInterface<T = AuditVersion> {
  version: T;
}
