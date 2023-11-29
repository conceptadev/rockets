import { OrgMemberInterface } from '@concepta/ts-common';

export interface OrgMemberCreatableInterface
  extends Pick<OrgMemberInterface, 'orgId' | 'userId'> {}
