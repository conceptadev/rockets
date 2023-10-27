import {
  ReferenceActiveInterface,
  ReferenceAuditInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface UserInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    ReferenceAuditInterface {}
