import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { LookupService } from '@concepta/typeorm-common';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from '../role.constants';
import { RoleEntityInterface } from '../interfaces/role-entity.interface';
import { RoleLookupServiceInterface } from '../interfaces/role-lookup-service.interface';

/**
 * Role lookup service
 */
@Injectable()
export class RoleLookupService
  extends LookupService<RoleEntityInterface>
  implements RoleLookupServiceInterface
{
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
