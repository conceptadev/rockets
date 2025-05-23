import { Inject, Injectable } from '@nestjs/common';
import {
  ReferenceAssignment,
  ReferenceIdInterface,
  RepositoryInterface,
  ModelQueryException,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';
import { RoleEntityNotFoundException } from '../exceptions/role-entity-not-found.exception';
import { RoleAssignmentNotFoundException } from '../exceptions/role-assignment-not-found.exception';
import { RoleAssignmentConflictException } from '../exceptions/role-assignment-conflict.exception';
import {
  ROLE_MODULE_REPOSITORIES_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
} from '../role.constants';
import { RoleSettingsInterface } from '../interfaces/role-settings.interface';
import { RoleServiceInterface } from '../interfaces/role-service.interface';
import { RoleAssignmentOptionsInterface } from '../interfaces/role-assignment-options.interface';
import { RolesAssignmentOptionsInterface } from '../interfaces/roles-assignment-options.interface';
import { RoleAssignmentContext } from '../interfaces/role-assignment-context';

@Injectable()
export class RoleService implements RoleServiceInterface {
  constructor(
    @Inject(ROLE_MODULE_SETTINGS_TOKEN)
    protected readonly settings: RoleSettingsInterface,
    @Inject(ROLE_MODULE_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<
      string,
      RepositoryInterface<RoleAssignmentEntityInterface>
    >,
  ) {}

  /**
   * Get all roles for assignee.
   *
   * @param options - The assignment, assignee to check
   */
  async getAssignedRoles(
    options: RoleAssignmentContext<ReferenceIdInterface>,
  ): Promise<ReferenceIdInterface[]> {
    const { assignment, assignee } = options;
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assigneeId: assignee.id,
        },
      });

      // return the roles
      return assignments.map((assignment) => ({ id: assignment.roleId }));
    } catch (e) {
      throw new ModelQueryException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * Check if the assignee is a member of one role.
   *
   * @param options - The assignment, role and assignee to check
   */
  async isAssignedRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<boolean> {
    const { assignment, role, assignee } = options;

    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationship
    try {
      // make the query
      const assignment = await assignmentRepo.findOne({
        where: {
          roleId: role.id,
          assigneeId: assignee.id,
        },
      });

      // return true if we found an assignment
      return assignment ? true : false;
    } catch (e) {
      throw new ModelQueryException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * Check if the assignee is a member of every role.
   *
   * @param options - The assignment, roles and assignee to check
   */
  async isAssignedRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<boolean> {
    const { assignment, roles, assignee } = options;

    // get all assigned roles
    const assignedRoles = await this.getAssignedRoles({
      assignment,
      assignee,
    });

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
   * @param options - The assignment, role and assignee
   */
  async assignRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<RoleAssignmentEntityInterface> {
    const { assignment, role, assignee } = options;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // check if the role is already assigned
    const isAlreadyAssigned = await this.isAssignedRole({
      assignment,
      role,
      assignee,
    });

    if (isAlreadyAssigned) {
      throw new RoleAssignmentConflictException(
        assignment,
        role.id,
        assignee.id,
      );
    }
    // TODO: Review this change to validate the transacion being used
    // create the new role assignment entity
    const roleAssignment = assignmentRepo.create({
      roleId: role.id,
      assigneeId: assignee.id,
    });

    return assignmentRepo.save(roleAssignment);
  }

  /**
   * Assign multiple roles to an assignee.
   *
   * @param options - The assignment, roles and assignee
   */
  async assignRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<RoleAssignmentEntityInterface[]> {
    const { assignment, roles, assignee } = options;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // prepare the bulk data for assignment
    const roleAssignments: RoleAssignmentEntityInterface[] = [];

    for (const role of roles) {
      // check if the role is already assigned
      const isAlreadyAssigned = await this.isAssignedRole({
        assignment,
        role,
        assignee,
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
          roleId: role.id,
          assigneeId: assignee.id,
        });

      roleAssignments.push(roleAssignment);
    }

    return assignmentRepo.save(roleAssignments);
  }

  /**
   * Revoke a role from an assignee.
   *
   * @param options - The assignment, role and assignee
   */
  async revokeRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<void> {
    const { assignment, role, assignee } = options;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    if (role?.id && assignee?.id) {
      const roleAssignment = await assignmentRepo.find({
        where: {
          roleId: role.id,
          assigneeId: assignee.id,
        },
      });

      if (roleAssignment) {
        await assignmentRepo.remove(roleAssignment);
      }
    }
  }

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param options - The assignment, roles and assignee
   */
  async revokeRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<void> {
    const { assignment, roles, assignee } = options;
    const assignmentRepo = this.getAssignmentRepo(assignment);

    for (const role of roles) {
      if (role?.id && assignee?.id) {
        const roleAssignment = await assignmentRepo.find({
          where: {
            roleId: role.id,
            assigneeId: assignee.id,
          },
        });

        if (roleAssignment) {
          await assignmentRepo.remove(roleAssignment);
        }
      }
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
  ): RepositoryInterface<RoleAssignmentEntityInterface> {
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
