import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-common';
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
   * @param roleRepo - instance of the role repository.
   */
  constructor(
    // TODO: TYPEORM - TypeOrmCrudService uses typeorm repository
    @InjectDynamicRepository(ROLE_MODULE_ROLE_ENTITY_KEY)
    roleRepo: Repository<RoleEntityInterface>,
  ) {
    super(roleRepo);
  }
}
