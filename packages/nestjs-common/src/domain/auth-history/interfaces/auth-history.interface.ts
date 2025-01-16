import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { AuthenticatedUserRequestInterface } from '../../authentication/interfaces/authenticated-info.interface';
import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';

export interface AuthHistoryInterface
  extends ReferenceIdInterface,
    UserOwnableInterface,
    AuditInterface,
    Pick<
      AuthenticatedUserRequestInterface,
      'authType' | 'ipAddress' | 'deviceInfo'
    >,
    Partial<Pick<AuthenticatedUserRequestInterface, 'deviceInfo'>> {}
