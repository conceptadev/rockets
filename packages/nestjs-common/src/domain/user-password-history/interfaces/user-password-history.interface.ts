import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { PasswordStorageInterface } from '../../password/interfaces/password-storage.interface';
import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';

export interface UserPasswordHistoryInterface
  extends ReferenceIdInterface,
    PasswordStorageInterface,
    UserOwnableInterface,
    AuditInterface {}
