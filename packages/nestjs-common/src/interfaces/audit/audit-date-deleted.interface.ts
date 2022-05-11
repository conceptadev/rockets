import { AuditDateDeleted } from '../../audit/audit.types';

/**
 * Date data was deleted.
 */
export interface AuditDateDeletedInterface<T = AuditDateDeleted> {
  dateDeleted: T;
}
