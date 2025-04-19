import { AssigneeRelationInterface } from '../../assignee/interfaces/assignee-relation.interface';
import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentCreatableInterface
  extends RoleRelationInterface,
    AssigneeRelationInterface {}
