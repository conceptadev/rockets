import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { MutateService } from '@concepta/nestjs-typeorm-ext';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OrgMutateServiceInterface } from '../interfaces/org-mutate-service.interface';
import { OrgCreatableInterface } from '../interfaces/org-creatable.interface';
import { OrgUpdatableInterface } from '../interfaces/org-updatable.interface';
import { OrgCreateDto } from '../dto/org-create.dto';
import { OrgUpdateDto } from '../dto/org-update.dto';
import { ORG_MODULE_ORG_CUSTOM_REPO_TOKEN } from '../org.constants';

/**
 * User mutate service
 */
@Injectable()
export class OrgMutateService
  extends MutateService<
    OrgEntityInterface,
    OrgCreatableInterface,
    ReferenceIdInterface & OrgUpdatableInterface
  >
  implements OrgMutateServiceInterface
{
  protected createDto = OrgCreateDto;
  protected updateDto = OrgUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the user repo
   */
  constructor(
    @Inject(ORG_MODULE_ORG_CUSTOM_REPO_TOKEN)
    protected repo: Repository<OrgEntityInterface>,
  ) {
    super(repo);
  }
}
