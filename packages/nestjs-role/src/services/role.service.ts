import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import {
  ReferenceAssignment,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import {
  QueryOptionsInterface,
  ReferenceLookupException,
  RepositoryProxy,
} from '@concepta/typeorm-common';
import { RoleEntityNotFoundException } from '../exceptions/role-entity-not-found.exception';
import { RoleAssignmentNotFoundException } from '../exceptions/role-assignment-not-found.exception';
import { RoleAssignmentConflictException } from '../exceptions/role-assignment-conflict.exception';
import { RoleAssignmentEntityInterface } from '../interfaces/role-assignment-entity.interface';
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
    protected readonly settings: RoleSettingsInterface,
    @Inject(ROLE_MODULE_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<
      string,
      Repository<RoleAssignmentEntityInterface>
    >,
  ) {}

  /**
   * Get all roles for assignee.
   *
   * @param assignment - The assignment of the check (same as entity key)
   * @param assignee - The assignee to check
   */
  async getAssignedRoles(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleEntityInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // new repo proxy
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );

    // try to find the relationships
    try {
      // make the query
      const assignments = await repoProxy.repository(queryOptions).find({
        where: {
          assignee: { id: assignee.id },
        },
        relations: ['role', 'assignee'],
      });

      // return the roles
      return assignments.map((assignment) => assignment.role);
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  /**
   * Check if the assignee is a member of one role.
   *
   * @param assignment - The assignment of the check
   * @param role - The role to check
   * @param assignee - The assignee to check
   */
  async isAssignedRole<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    role: ReferenceIdInterface,
    assignee: T,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // new repo proxy
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );

    // try to find the relationship
    try {
      // make the query
      const assignment = await repoProxy.repository(queryOptions).findOne({
        where: {
          role: { id: role.id },
          assignee: { id: assignee.id },
        },
      });

      // return true if we found an assignment
      return assignment ? true : false;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  /**
   * Check if the assignee is a member of every role.
   *
   * @param assignment - The assignment of the check
   * @param roles - The roles to check
   * @param assignee - The assignee to check
   */
  async isAssignedRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    // get all assigned roles
    const assignedRoles = await this.getAssignedRoles(
      assignment,
      assignee,
      queryOptions,
    );

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
   * Assign a role to an assignee.
   *
   * @param assignment - The assignment type
   * @param role - The role to assign
   * @param assignee - The assignee to assign the role
   */
  async assignRole<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    role: ReferenceIdInterface,
    assignee: T,
  ): Promise<RoleAssignmentEntityInterface> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // check if the role is already assigned
    const isAlreadyAssigned = await this.isAssignedRole(
      assignment,
      role,
      assignee,
    );

    if (isAlreadyAssigned) {
      throw new RoleAssignmentConflictException(
        assignment,
        role.id,
        assignee.id,
      );
    }

    // create the new role assignment entity
    const roleAssignment: RoleAssignmentEntityInterface = assignmentRepo.create(
      {
        role,
        assignee,
      },
    );

    // save the new role assignment
    return assignmentRepo.save(roleAssignment);
  }

  /**
   * Assign multiple roles to an assignee.
   *
   * @param assignment - The assignment type
   * @param roles - The roles to assign
   * @param assignee - The assignee to assign the roles
   */
  async assignRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
  ): Promise<RoleAssignmentEntityInterface[]> {
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // prepare the bulk data for assignment
    const roleAssignments: RoleAssignmentEntityInterface[] = [];

    for (const role of roles) {
      // check if the role is already assigned
      const isAlreadyAssigned = await assignmentRepo.findOne({
        where: {
          role: { id: role.id },
          assignee: { id: assignee.id },
        },
      });

      if (isAlreadyAssigned) {
        // skip this role if it is already assigned
        throw new RoleAssignmentConflictException(
          assignment,
          role.id,
          assignee.id,
        );
      }

      // create and add the new role assignment entity to the bulk array
      const roleAssignment: RoleAssignmentEntityInterface =
        assignmentRepo.create({
          role,
          assignee,
        });

      roleAssignments.push(roleAssignment);
    }

    // perform the bulk save operation
    return assignmentRepo.save(roleAssignments);
  }

  /**
   * Revoke a role from an assignee.
   *
   * @param assignment - The assignment type
   * @param role - The role to revoke
   * @param assignee - The assignee from whom the role is to be revoked
   */
  async revokeRole<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    role: ReferenceIdInterface,
    assignee: T,
  ): Promise<void> {
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // remove the role assignment if it exists
    await assignmentRepo.delete({
      role: { id: role.id },
      assignee: { id: assignee.id },
    });
  }

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param assignment - The assignment type
   * @param roles - The roles to revoke
   * @param assignee - The assignee from whom the roles are to be revoked
   */
  async revokeRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
  ): Promise<void> {
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // loop through each role and delete the corresponding assignment
    for (const role of roles) {
      await assignmentRepo.delete({
        role: { id: role.id },
        assignee: { id: assignee.id },
      });
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @internal
   * @param assignment - The role assignment
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
        throw new RoleEntityNotFoundException(entityKey);
      }
    } else {
      // bad assignment
      throw new RoleAssignmentNotFoundException(assignment);
    }
  }
}
