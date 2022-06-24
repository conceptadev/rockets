import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceAssignment, ReferenceIdInterface } from '@concepta/ts-core';
import { ReferenceLookupException } from '@concepta/typeorm-common';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { AssignmentNotFoundException } from '../exceptions/assignment-not-found.exception';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';
import { RoleInterface } from '../interfaces/role.interface';
import {
  ROLE_MODULE_REPOSITORIES_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
} from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';
import { RoleSettingsInterface } from '../interfaces/role-settings.interface';
import { RoleServiceInterface } from '../interfaces/role-service.interface';

@Injectable()
export class RoleService implements RoleServiceInterface {
  constructor(
    @Inject(ROLE_MODULE_SETTINGS_TOKEN)
    private settings: RoleSettingsInterface,
    @Inject(ROLE_MODULE_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<
      string,
      Repository<RoleAssignmentEntityInterface>
    >,
  ) {}

  /**
   * Get all roles for assignee.
   *
   * @param assignment The assignment of the check (same as entity key)
   * @param assignee The assignee to check
   */
  async getAssignedRoles(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
  ): Promise<RoleEntityInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assignee,
        },
        relations: ['role', 'assignee'],
      });

      // return the roles
      return assignments.map((assignment) => assignment.role);
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Check if the assignee is a member of one role.
   *
   * @param assignment The assignment of the check
   * @param role The role to check
   * @param assignee The assignee to check
   */
  async isAssignedRole<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    role: Partial<RoleInterface>,
    assignee: T,
  ): Promise<boolean> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationship
    try {
      // make the query
      const assignment = await assignmentRepo.findOne({
        where: {
          role,
          assignee,
        },
      });
      // return true if we found an assignment
      return assignment ? true : false;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Check if the assignee is a member of every role.
   *
   * @param assignment The assignment of the check
   * @param roles The roles to check
   * @param assignee The assignee to check
   */
  async isAssignedRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
  ): Promise<boolean> {
    // get all assigned roles
    const assignedRoles = await this.getAssignedRoles(assignment, assignee);

    // get any roles to check?
    if (roles.length) {
      // create an array of all ids
      const assignedRoleIds = assignedRoles.map(
        (assignedRole) => assignedRole.id,
      );
      // is in every role?
      return roles.every((role) => {
        return assignedRoleIds.includes(role.id);
      });
    } else {
      // no roles to check!
      return false;
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @private
   * @param assignment The role assignment
   */
  protected getAssignmentRepo(
    assignment: ReferenceAssignment,
  ): Repository<RoleAssignmentEntityInterface> {
    // have entity key for given assignment?
    if (this.settings.assignments[assignment]) {
      // yes, set it
      const entityKey = this.settings.assignments[assignment].entityKey;
      // repo matching assignment was injected?
      if (this.allRoleRepos[entityKey]) {
        // yes, return it
        return this.allRoleRepos[entityKey];
      } else {
        // bad entity key
        throw new EntityNotFoundException(entityKey);
      }
    } else {
      // bad assignment
      throw new AssignmentNotFoundException(assignment);
    }
  }
}
