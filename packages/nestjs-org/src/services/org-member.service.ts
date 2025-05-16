import { Inject, Injectable } from '@nestjs/common';
import {
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import { ORG_MODULE_ORG_MEMBER_ENTITY_KEY } from '../org.constants';
import { OrgMemberEntityInterface } from '@concepta/nestjs-common';
import { OrgMemberServiceInterface } from '../interfaces/org-member-service.interface';
import { OrgMemberCreatableInterface } from '../interfaces/org-member-creatable.interface';
import { OrgMemberModelService } from './org-member-model.service';
import { OrgMemberException } from '../exceptions/org-member.exception';
import { OrgMemberModelServiceInterface } from '../interfaces/org-member-model-service.interface';

@Injectable()
export class OrgMemberService implements OrgMemberServiceInterface {
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_MEMBER_ENTITY_KEY)
    protected readonly repo: RepositoryInterface<OrgMemberEntityInterface>,
    @Inject(OrgMemberModelService)
    protected readonly orgMemberModelService: OrgMemberModelServiceInterface,
  ) {}

  async add(
    orgMember: OrgMemberCreatableInterface,
  ): Promise<OrgMemberEntityInterface> {
    const orgMemberFound = await this.repo.findOne({ where: orgMember });

    if (orgMemberFound) {
      const { userId, orgId } = orgMember;
      throw new OrgMemberException({
        message: `Can't create OrgMember, the the combination of userid: %s and orgId: %s already exists`,
        messageParams: [userId, orgId],
      });
    }

    return this.orgMemberModelService.create(orgMember);
  }

  async remove(id: string): Promise<OrgMemberEntityInterface> {
    return this.orgMemberModelService.remove({ id });
  }
}
