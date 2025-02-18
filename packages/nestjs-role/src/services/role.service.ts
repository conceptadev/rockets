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
import { AssignmentContext } from '../interfaces/assignment-context';
import { RoleAssignmentParams } from '../interfaces/role-assignment-params';
import { RolesAssignmentParams } from '../interfaces/roles-assignment-params';

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
   * @param params - The assignment, assignee to check
   * @param queryOptions - Optional query options
   */
  async getAssignedRoles(
    params: AssignmentContext<ReferenceIdInterface>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleEntityInterface[]> {
    const { assignment, assignee } = params;
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
   * @param params - The assignment, role and assignee to check
   * @param queryOptions - Optional query options
   */
  async isAssignedRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    const { assignment, role, assignee } = params;

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
   * @param params - The assignment, roles and assignee to check
   * @param queryOptions - Optional query options
   */
  async isAssignedRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean> {
    const { assignment, roles, assignee } = params;

    // get all assigned roles
    const assignedRoles = await this.getAssignedRoles(
      {
        assignment,
        assignee,
      },
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
   * @param params - The assignment, role and assignee
   * @param queryOptions - Optional query options
   */
  async assignRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleAssignmentEntityInterface> {
    const { assignment, role, assignee } = params;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // check if the role is already assigned
    const isAlreadyAssigned = await this.isAssignedRole(
      {
        assignment,
        role,
        assignee,
      },
      queryOptions,
    );

    if (isAlreadyAssigned) {
      throw new RoleAssignmentConflictException(
        assignment,
        role.id,
        assignee.id,
      );
    }
    // TODO: Review this change to validate the transacion being used
    // create the new role assignment entity
    const roleAssignment: RoleAssignmentEntityInterface = assignmentRepo.create(
      {
        role,
        assignee,
      },
    );

    // Use repository proxy to apply query options
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );
    return repoProxy.repository(queryOptions).save(roleAssignment);
  }

  /**
   * Assign multiple roles to an assignee.
   *
   * @param params - The assignment, roles and assignee
   * @param queryOptions - Optional query options
   */
  async assignRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleAssignmentEntityInterface[]> {
    const { assignment, roles, assignee } = params;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // prepare the bulk data for assignment
    const roleAssignments: RoleAssignmentEntityInterface[] = [];

    for (const role of roles) {
      // check if the role is already assigned
      const isAlreadyAssigned = await this.isAssignedRole(
        {
          assignment,
          role,
          assignee,
        },
        queryOptions,
      );

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

    // Use repository proxy to apply query options
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );
    return repoProxy.repository(queryOptions).save(roleAssignments);
  }

  /**
   * Revoke a role from an assignee.
   *
   * @param params - The assignment, role and assignee
   * @param queryOptions - Optional query options
   */
  async revokeRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    const { assignment, role, assignee } = params;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // Use repository proxy to apply query options
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );
    await repoProxy.repository(queryOptions).delete({
      role: { id: role.id },
      assignee: { id: assignee.id },
    });
  }

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param params - The assignment, roles and assignee
   * @param queryOptions - Optional query options
   */
  async revokeRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    const { assignment, roles, assignee } = params;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // Use repository proxy to apply query options
    const repoProxy = new RepositoryProxy<RoleAssignmentEntityInterface>(
      assignmentRepo,
    );

    for (const role of roles) {
      await repoProxy.repository(queryOptions).delete({
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
