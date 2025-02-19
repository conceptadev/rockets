import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { RoleAssignmentContext } from './role-assignment-context';

export interface RoleAssignmentOptions<T extends ReferenceIdInterface>
  extends RoleAssignmentContext<T> {
  role: ReferenceIdInterface;
}
