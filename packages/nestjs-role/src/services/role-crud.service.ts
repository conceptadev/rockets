import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';

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
    @InjectDynamicRepository(ROLE_MODULE_ROLE_ENTITY_KEY)
    roleRepo: Repository<RoleEntityInterface>,
  ) {
    super(roleRepo);
  }
}
