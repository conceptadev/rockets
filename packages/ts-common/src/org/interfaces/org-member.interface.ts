import {
  AuditInterface,
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface OrgMemberInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface {
  orgId: string;
  userId: string;
}
