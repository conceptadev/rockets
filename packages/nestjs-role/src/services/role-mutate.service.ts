import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';
import { RoleMutateServiceInterface } from '../interfaces/role-mutate-service.interface';
import { RoleCreatableInterface } from '../interfaces/role-creatable.interface';
import { RoleUpdatableInterface } from '../interfaces/role-updatable.interface';
import { RoleCreateDto } from '../dto/role-create.dto';
import { RoleUpdateDto } from '../dto/role-update.dto';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';

/**
 * Role mutate service
 */
@Injectable()
export class RoleMutateService
  extends MutateService<
    RoleEntityInterface,
    RoleCreatableInterface,
    RoleUpdatableInterface
  >
  implements RoleMutateServiceInterface
{
  protected createDto = RoleCreateDto;
  protected updateDto = RoleUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the role repo
   */
  constructor(
    @InjectDynamicRepository(ROLE_MODULE_ROLE_ENTITY_KEY)
    protected repo: Repository<RoleEntityInterface>,
  ) {
    super(repo);
  }
}
