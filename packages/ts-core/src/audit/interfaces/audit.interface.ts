import { AuditDateCreatedInterface } from './audit-date-created.interface';
import { AuditDateDeletedInterface } from './audit-date-deleted.interface';
import { AuditDateUpdatedInterface } from './audit-date-updated.interface';
import { AuditVersionInterface } from './audit-version.interface';

export interface AuditInterface
  extends AuditDateCreatedInterface,
    AuditDateUpdatedInterface,
    AuditDateDeletedInterface,
    AuditVersionInterface {}
