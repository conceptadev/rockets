import {
  ReferenceAssigneeInterface,
  ReferenceAssignmentInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface RoleAssignmentContext<T extends ReferenceIdInterface>
  extends ReferenceAssignmentInterface,
    ReferenceAssigneeInterface<T> {}
