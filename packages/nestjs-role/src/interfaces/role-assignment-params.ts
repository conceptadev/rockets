import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { AssignmentContext } from './assignment-context';

export interface RoleAssignmentParams<T extends ReferenceIdInterface>
  extends AssignmentContext<T> {
  role: ReferenceIdInterface;
}
