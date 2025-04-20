import { Inject, Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  ModelService,
  OrgCreatableInterface,
  OrgOwnerInterface,
  OrgReplaceableInterface,
  OrgUpdatableInterface,
  RepositoryInterface,
} from '@concepta/nestjs-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OrgModelServiceInterface } from '../interfaces/org-model-service.interface';
import { OrgCreateDto } from '../dto/org-create.dto';
import { OrgUpdateDto } from '../dto/org-update.dto';
import {
  ORG_MODULE_ORG_ENTITY_KEY,
  ORG_MODULE_OWNER_MODEL_SERVICE_TOKEN,
} from '../org.constants';
import { OrgOwnerModelServiceInterface } from '../interfaces/org-owner-model-service.interface';

/**
 * Org model service
 */
@Injectable()
export class OrgModelService
  extends ModelService<
    OrgEntityInterface,
    OrgCreatableInterface,
    OrgUpdatableInterface,
    OrgReplaceableInterface
  >
  implements OrgModelServiceInterface
{
  protected createDto = OrgCreateDto;
  protected updateDto = OrgUpdateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the org repo
   */
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_ENTITY_KEY)
    repo: RepositoryInterface<OrgEntityInterface>,
    @Inject(ORG_MODULE_OWNER_MODEL_SERVICE_TOKEN)
    protected readonly ownerModelService: OrgOwnerModelServiceInterface,
  ) {
    super(repo);
  }

  /**
   * Get owner for the given org.
   *
   * @param org - The org of which owner to retrieve.
   */
  async getOwner(org: OrgOwnerInterface) {
    return this.ownerModelService.byId(org.ownerId);
  }
}
