import { AuditInterface } from '../../audit/interfaces/audit.interface';

/**
 * The audit data.
 */
export interface ReferenceAuditInterface<T = AuditInterface> {
  audit: T;
}
