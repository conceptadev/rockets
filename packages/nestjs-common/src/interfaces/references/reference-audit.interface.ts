import { AuditInterface } from '../audit/audit.interface';

/**
 * The audit data.
 */
export interface ReferenceAuditInterface<T = AuditInterface> {
  audit: T;
}
