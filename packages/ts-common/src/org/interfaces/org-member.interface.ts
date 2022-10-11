import {
  ReferenceActiveInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface OrgMemberInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    ReferenceAuditInterface {
  orgId: string;
  userId: string;
}
