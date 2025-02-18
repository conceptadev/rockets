import {
  ReferenceAssignment,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AssignmentContext<T extends ReferenceIdInterface> {
  assignment: ReferenceAssignment;
  assignee: T;
}
