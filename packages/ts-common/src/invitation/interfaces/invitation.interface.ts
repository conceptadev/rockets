import {
  AuditInterface,
  LiteralObject,
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface InvitationInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface {
  email: string;
  code: string;
  category: string;
  user: ReferenceIdInterface;
  constraints?: LiteralObject;
}
