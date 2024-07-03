import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  OrgCreatableInterface,
  OrgUpdatableInterface,
} from '@concepta/ts-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OrgMutateServiceInterface } from '../interfaces/org-mutate-service.interface';
import { OrgCreateDto } from '../dto/org-create.dto';
import { OrgUpdateDto } from '../dto/org-update.dto';
import { ORG_MODULE_ORG_ENTITY_KEY } from '../org.constants';

/**
 * Org mutate service
 */
@Injectable()
export class OrgMutateService
  extends MutateService<
    OrgEntityInterface,
    OrgCreatableInterface,
    OrgUpdatableInterface
  >
  implements OrgMutateServiceInterface
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
    repo: Repository<OrgEntityInterface>,
  ) {
    super(repo);
  }
}
