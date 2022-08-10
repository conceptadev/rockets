import {
  ReferenceActiveInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface InvitationInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface,
    ReferenceActiveInterface {
  email: string;
  code: string;
  category: string;
  user: ReferenceIdInterface;
}
