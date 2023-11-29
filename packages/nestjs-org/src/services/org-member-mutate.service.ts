import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Type } from '@concepta/ts-core';

import { OrgMemberMutateServiceInterface } from '../interfaces/org-member-mutate-service.interface';
import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';
import { ORG_MODULE_ORG_MEMBER_ENTITY_KEY } from '../org.constants';
import { OrgMemberCreatableInterface } from '../interfaces/org-member-creatable.interface';
import { OrgMemberUpdatableInterface } from '../interfaces/org-member-updatable.interface';

/**
 * User mutate service
 */
@Injectable()
export class OrgMemberMutateService
  extends MutateService<
    OrgMemberEntityInterface,
    OrgMemberCreatableInterface,
    OrgMemberUpdatableInterface
  >
  implements OrgMemberMutateServiceInterface
{
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_MEMBER_ENTITY_KEY)
    repo: Repository<OrgMemberEntityInterface>,
  ) {
    super(repo);
  }

  protected createDto!: Type<OrgMemberCreatableInterface>;
  protected updateDto!: Type<OrgMemberUpdatableInterface>;
}
