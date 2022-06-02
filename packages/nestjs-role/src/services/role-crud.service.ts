import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import {
  ALL_ROLES_REPOSITORIES_TOKEN,
  ROLE_MODULE_ORG_ENTITY_KEY,
} from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';
import { RoleTargetInterface } from '../interfaces/role-target.interface';
import { EntityNotFoundException } from '../exceptions/entity-not-found-.exception';

/**
 * Role CRUD service
 */
@Injectable()
export class RoleCrudService extends TypeOrmCrudService<RoleEntityInterface> {
  /**
   * Constructor
   *
   * @param roleRepo instance of the role repository.
   */
  constructor(
    @InjectDynamicRepository(ROLE_MODULE_ORG_ENTITY_KEY)
    roleRepo: Repository<RoleEntityInterface>,
    // it will inject a list of strings
    @Inject(ALL_ROLES_REPOSITORIES_TOKEN)
    private allRoleRepos: Record<string, Repository<RoleTargetInterface>>,
  ) {
    super(roleRepo);
  }

  hasRole(context: string, targetId: string, roleId: string) {
    if (!this.allRoleRepos[context]) throw new EntityNotFoundException(context);

    return this.allRoleRepos[context].findOne({
      where: {
        targetId,
        roleId,
      },
    });
  }
}
