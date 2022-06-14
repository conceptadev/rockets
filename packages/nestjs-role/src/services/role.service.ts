import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ReferenceLookupException } from '@concepta/typeorm-common';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { RoleAssigneeInterface } from '../interfaces/role-assignee.interface';
import { RoleAssignmentInterface } from '../interfaces/role-assignment.interface';
import { RoleInterface } from '../interfaces/role.interface';
import { ALL_ROLES_REPOSITORIES_TOKEN } from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ALL_ROLES_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<string, Repository<RoleAssignmentInterface>>,
  ) {}

  /**
   * Get all roles for assignee.
   *
   * @param context The context of the check (same as entity key)
   * @param assignee The assignee to check
   */
  async getAssignedRoles(
    context: string,
    assignee: Partial<RoleAssigneeInterface>,
  ): Promise<RoleEntityInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(context);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assignee,
        },
        relations: [context],
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
   * @param context The context of the check (same as entity key)
   * @param role The role to check
   * @param assignee The assignee to check
   */
  async isAssignedRole<T extends RoleAssigneeInterface>(
    context: string,
    role: Partial<RoleInterface>,
    assignee: Partial<T>,
  ): Promise<boolean> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(context);

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
   * @param context The context of the check (same as entity key)
   * @param roles The roles to check
   * @param assignee The assignee to check
   */
  async isAssignedRoles<T extends RoleAssigneeInterface>(
    context: string,
    roles: ReferenceIdInterface[],
    assignee: Partial<T>,
  ): Promise<boolean> {
    // get all assigned roles
    const assignedRoles = await this.getAssignedRoles(context, assignee);

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
   * Get the assignment repo for the given context.
   *
   * @private
   * @param context The role context (same as entity key)
   */
  protected getAssignmentRepo(
    context: string,
  ): Repository<RoleAssignmentInterface> {
    // repo matching context was injected?
    if (this.allRoleRepos[context]) {
      // yes, return it
      return this.allRoleRepos[context];
    } else {
      // bad context
      throw new EntityNotFoundException(context);
    }
  }
}
