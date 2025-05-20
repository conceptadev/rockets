import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { Repository } from 'typeorm';
import { RoleEntityInterface } from '@concepta/nestjs-common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntityFixture } from '../entities/role-entity.fixture';

/**
 * Role CRUD service
 */
@Injectable()
export class RoleCrudServiceFixture extends TypeOrmCrudService<RoleEntityInterface> {
  /**
   * Constructor
   *
   * @param roleRepo - instance of the role repository.
   */
  constructor(
    @InjectRepository(RoleEntityFixture)
    roleRepo: Repository<RoleEntityInterface>,
  ) {
    super(roleRepo);
  }
}
