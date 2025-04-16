import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssigneesInterface<
  T extends ReferenceIdInterface &
    RoleRelationInterface = ReferenceIdInterface & RoleRelationInterface,
> {
  assignees: T[];
}
