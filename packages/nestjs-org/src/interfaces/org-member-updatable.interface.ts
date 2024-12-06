import { OrgMemberInterface } from '@concepta/nestjs-common';

export interface OrgMemberUpdatableInterface
  extends Pick<OrgMemberInterface, 'orgId' | 'userId'> {}
