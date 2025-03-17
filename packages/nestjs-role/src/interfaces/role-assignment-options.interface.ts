import {
  ReferenceIdInterface,
  ReferenceRoleInterface,
} from '@concepta/nestjs-common';
import { RoleAssignmentContext } from './role-assignment-context';

export interface RoleAssignmentOptionsInterface<T extends ReferenceIdInterface>
  extends RoleAssignmentContext<T>,
    ReferenceRoleInterface {}
