import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';

export interface OrgMemberInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface {
  orgId: string;
  userId: string;
}
