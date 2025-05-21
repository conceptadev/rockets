import { Injectable } from '@nestjs/common';
import {
  ModelService,
  OrgCreatableInterface,
  OrgReplaceableInterface,
  OrgUpdatableInterface,
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';
import { OrgEntityInterface } from '@concepta/nestjs-common';
import { OrgModelServiceInterface } from '../interfaces/org-model-service.interface';
import { OrgCreateDto } from '../dto/org-create.dto';
import { OrgUpdateDto } from '../dto/org-update.dto';
import { ORG_MODULE_ORG_ENTITY_KEY } from '../org.constants';

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
  ) {
    super(repo);
  }
}
