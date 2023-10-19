import { OrgMemberEntityInterface } from './org-member-entity.interface';
import { OrgMemberCreatableInterface } from './org-member-creatable.interface';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OrgMemberServiceInterface {
  add(
    orgMember: OrgMemberCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<OrgMemberEntityInterface>;
  remove(
    id: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<OrgMemberEntityInterface>;
}
