import {
  ReferenceIdInterface,
  ReferenceRolesInterface,
} from '@concepta/nestjs-common';
import { RoleAssignmentContext } from './role-assignment-context';

export interface RolesAssignmentOptionsInterface<T extends ReferenceIdInterface>
  extends RoleAssignmentContext<T>,
    ReferenceRolesInterface {}
