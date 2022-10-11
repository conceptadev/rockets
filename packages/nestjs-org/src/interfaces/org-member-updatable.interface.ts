import { OrgMemberInterface } from '@concepta/ts-common';

export interface OrgMemberUpdatableInterface
  extends Pick<OrgMemberInterface, 'orgId' | 'userId'> {}
