import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { UserRolesInterface } from '../../user/interfaces/user-roles.interface';

export interface AuthenticatedUserInterface
  extends ReferenceIdInterface,
    Partial<UserRolesInterface> {}
