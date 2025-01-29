import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceEmailInterface } from '../../../reference/interfaces/reference-email.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceLockStatusInterface } from '../../../reference/interfaces/reference-lock-status.interface';
import { ReferenceUsernameInterface } from '../../../reference/interfaces/reference-username.interface';

export interface UserInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    ReferenceLockStatusInterface,
    AuditInterface {}
