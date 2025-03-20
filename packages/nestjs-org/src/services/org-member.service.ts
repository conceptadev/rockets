import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  BaseService,
  QueryOptionsInterface,
  RepositoryInterface,
} from '@concepta/typeorm-common';

import { ORG_MODULE_ORG_MEMBER_ENTITY_KEY } from '../org.constants';
import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';
import { OrgMemberServiceInterface } from '../interfaces/org-member-service.interface';
import { OrgMemberCreatableInterface } from '../interfaces/org-member-creatable.interface';
import { OrgLookupService } from './org-lookup.service';
import { OrgMemberLookupService } from './org-member-lookup.service';
import { OrgMemberMutateService } from './org-member-mutate.service';
import { OrgMemberException } from '../exceptions/org-member.exception';

@Injectable()
export class OrgMemberService
  extends BaseService<OrgMemberEntityInterface>
  implements OrgMemberServiceInterface
{
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_MEMBER_ENTITY_KEY)
    repo: RepositoryInterface<OrgMemberEntityInterface>,
    protected readonly orgLookupService: OrgLookupService,
    protected readonly orgMemberLookupService: OrgMemberLookupService,
    protected readonly orgMemberMutateService: OrgMemberMutateService,
  ) {
    super(repo);
  }

  async add(
    orgMember: OrgMemberCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<OrgMemberEntityInterface> {
    const orgMemberFound = await this.orgMemberLookupService.findOne(
      { where: orgMember },
      queryOptions,
    );

    if (orgMemberFound) {
      const { userId, orgId } = orgMember;
      throw new OrgMemberException({
        message: `Can't create OrgMember, the the combination of userid: %s and orgId: %s already exists`,
        messageParams: [userId, orgId],
      });
    }

    return await this.orgMemberMutateService.create(orgMember, queryOptions);
  }

  async remove(
    id: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<OrgMemberEntityInterface> {
    return await this.orgMemberMutateService.remove({ id }, queryOptions);
  }
}
