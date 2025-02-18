import {
  ReferenceAssigneeInterface,
  ReferenceAssignment,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AssignmentContext<T extends ReferenceIdInterface>
  extends ReferenceAssigneeInterface<T> {
  assignment: ReferenceAssignment;
}
