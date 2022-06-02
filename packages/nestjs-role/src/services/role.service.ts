import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceLookupException } from '@concepta/typeorm-common';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { RoleAssigneeInterface } from '../interfaces/role-assignee.interface';
import { RoleAssignmentInterface } from '../interfaces/role-assignment.interface';
import { RoleInterface } from '../interfaces/role.interface';
import { ALL_ROLES_REPOSITORIES_TOKEN } from '../role.constants';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ALL_ROLES_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<string, Repository<RoleAssignmentInterface>>,
  ) {}

  /**
   * Check all roles that match assignment.
   *
   * @param context The context of the check (same as entity key)
   * @param assignee The assignee to check
   */
  async getRoles<T extends RoleAssignmentInterface = RoleAssignmentInterface>(
    context: string,
    assignee: Partial<RoleAssigneeInterface>,
  ): Promise<T[] | RoleAssignmentInterface[]> {
    // get the role repo
    const roleRepo = this.getRoleRepo(context);

    // try to find the relationships
    try {
      // make the query
      return roleRepo.find({
        where: {
          assignee,
        },
      });
    } catch (e) {
      // is an Error?
      if (e instanceof Error) {
        // yes, throw custom exception
        throw new ReferenceLookupException(roleRepo.metadata.targetName, e);
      } else {
        // throw original error
        throw e;
      }
    }
  }

  /**
   * Check if the assignee is a member of one role.
   *
   * @param context The context of the check (same as entity key)
   * @param role The role, or roles to check
   * @param assignee The assignee to check
   */
  async hasRole<T extends RoleAssigneeInterface>(
    context: string,
    role: Partial<RoleInterface>,
    assignee: Partial<T>,
  ): Promise<boolean> {
    // get the role repo
    const roleRepo = this.getRoleRepo(context);

    // try to find the relationship
    try {
      // make the query
      const assignment = await roleRepo.findOne({
        where: {
          role,
          assignee,
        },
      });
      // return true if we found an assignment
      return assignment ? true : false;
    } catch (e) {
      // is an Error?
      if (e instanceof Error) {
        // yes, throw custom exception
        throw new ReferenceLookupException(roleRepo.metadata.targetName, e);
      } else {
        // throw original error
        throw e;
      }
    }
  }

  /**
   * Get the role repo for the given context.
   *
   * @param context The role context (same as entity key)
   */
  protected getRoleRepo(context: string): Repository<RoleAssignmentInterface> {
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
