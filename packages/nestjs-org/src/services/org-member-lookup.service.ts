import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { LookupService } from '@concepta/typeorm-common';

import { ORG_MODULE_ORG_MEMBER_ENTITY_KEY } from '../org.constants';
import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';
import { OrgMemberLookupServiceInterface } from '../interfaces/org-member-lookup-service.interface';

/**
 * Org lookup service
 */
@Injectable()
export class OrgMemberLookupService
  extends LookupService<OrgMemberEntityInterface>
  implements OrgMemberLookupServiceInterface
{
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_MEMBER_ENTITY_KEY)
    repo: Repository<OrgMemberEntityInterface>,
  ) {
    super(repo);
  }
}
