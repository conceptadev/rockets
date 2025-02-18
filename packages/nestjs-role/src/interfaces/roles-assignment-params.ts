import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { AssignmentContext } from './assignment-context';

export interface RolesAssignmentParams<T extends ReferenceIdInterface>
  extends AssignmentContext<T> {
  roles: ReferenceIdInterface[];
}
