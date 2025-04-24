import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';
import { OrgOwnableInterface } from './org-ownable.interface';

export interface OrgMemberInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    OrgOwnableInterface,
    UserOwnableInterface,
    AuditInterface {}
