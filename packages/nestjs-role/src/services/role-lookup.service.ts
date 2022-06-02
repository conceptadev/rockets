import { FindConditions, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ReferenceId } from '@concepta/ts-core';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { ReferenceLookupException } from '@concepta/typeorm-common';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';
import { RoleLookupServiceInterface } from '../interfaces/role-lookup-service.interface';

/**
 * Role lookup service
 */
@Injectable()
export class RoleLookupService implements RoleLookupServiceInterface {
  /**
   * Constructor
   *
   * @param roleRepo instance of the role repo
   */
  constructor(
    @InjectDynamicRepository(ROLE_MODULE_ROLE_ENTITY_KEY)
    private roleRepo: Repository<RoleEntityInterface>,
  ) {}

  /**
   * Get role for the given id.
   *
   * @param id the id
   */
  async byId(id: ReferenceId): Promise<RoleEntityInterface | undefined> {
    return this.findOne({ id });
  }

  /**
   * Find One wrapper.
   *
   * @private
   * @param conditions Find conditions
   */
  protected async findOne(
    conditions?: FindConditions<RoleEntityInterface | undefined>,
  ): Promise<RoleEntityInterface | undefined> {
    try {
      // try to find the role
      return this.roleRepo.findOne(conditions);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.roleRepo.metadata.name, e);
    }
  }
}
