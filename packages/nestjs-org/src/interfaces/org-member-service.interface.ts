import { OrgMemberEntityInterface } from '@concepta/nestjs-common';
import { OrgMemberCreatableInterface } from './org-member-creatable.interface';

export interface OrgMemberServiceInterface {
  add(
    orgMember: OrgMemberCreatableInterface,
  ): Promise<OrgMemberEntityInterface>;
  remove(id: string): Promise<OrgMemberEntityInterface>;
}
