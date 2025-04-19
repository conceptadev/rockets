import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { LiteralObject } from '../../../utils/interfaces/literal-object.interface';
import { UserRelationInterface } from '../../user/interfaces/user-relation.interface';

export interface InvitationInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    UserRelationInterface,
    AuditInterface {
  code: string;
  category: string;
  constraints: LiteralObject | undefined;
}
