import {
  AuditInterface,
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface UserInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    AuditInterface {}
