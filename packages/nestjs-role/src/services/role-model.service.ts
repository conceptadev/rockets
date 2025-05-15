import { Injectable } from '@nestjs/common';
import {
  ModelService,
  RepositoryInterface,
  RoleCreatableInterface,
  RoleUpdatableInterface,
  InjectDynamicRepository,
  RoleEntityInterface,
} from '@concepta/nestjs-common';
import { RoleModelServiceInterface } from '../interfaces/role-model-service.interface';
import { RoleCreateDto } from '../dto/role-create.dto';
import { RoleUpdateDto } from '../dto/role-update.dto';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';

/**
 * Role model service
 */
@Injectable()
export class RoleModelService
  extends ModelService<
    RoleEntityInterface,
    RoleCreatableInterface,
    RoleUpdatableInterface
  >
  implements RoleModelServiceInterface
{
  protected createDto = RoleCreateDto;
  protected updateDto = RoleUpdateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the role repo
   */
  constructor(
    @InjectDynamicRepository(ROLE_MODULE_ROLE_ENTITY_KEY)
    repo: RepositoryInterface<RoleEntityInterface>,
  ) {
    super(repo);
  }
}
