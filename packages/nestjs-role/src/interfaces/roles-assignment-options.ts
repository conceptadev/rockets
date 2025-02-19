import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { RoleAssignmentContext } from './role-assignment-context';

export interface RolesAssignmentOptions<T extends ReferenceIdInterface>
  extends RoleAssignmentContext<T> {
  roles: ReferenceIdInterface[];
}
