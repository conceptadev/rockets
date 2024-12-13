import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { LiteralObject } from '../../../utils/interfaces/literal-object.interface';

export interface InvitationInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface {
  email: string;
  code: string;
  category: string;
  user: ReferenceIdInterface;
  constraints?: LiteralObject;
}
