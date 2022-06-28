import { RoleAssignmentInterface } from './role-assignment.interface';

export interface RoleAssignmentCreatableInterface
  extends Pick<RoleAssignmentInterface, 'role' | 'assignee'> {}
