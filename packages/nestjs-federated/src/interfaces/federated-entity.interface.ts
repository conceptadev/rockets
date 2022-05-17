import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface FederatedEntityInterface
  extends ReferenceIdInterface,
    Partial<ReferenceAuditInterface> {
  provider: string;
  // TODO: rename to `sub` via ReferenceSubjectInterface
  subject: string;
  userId: string;
}
