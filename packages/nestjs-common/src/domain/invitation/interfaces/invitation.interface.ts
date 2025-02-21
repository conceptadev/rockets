import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceUserInterface } from '../../../reference/interfaces/reference-user.interface';
import { LiteralObject } from '../../../utils/interfaces/literal-object.interface';

export interface InvitationInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    ReferenceUserInterface,
    AuditInterface {
  email: string;
  code: string;
  category: string;
  constraints?: LiteralObject;
}
