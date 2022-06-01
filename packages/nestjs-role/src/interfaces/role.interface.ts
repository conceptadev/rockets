import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface RoleInterface
  extends ReferenceIdInterface,
    Partial<ReferenceAuditInterface> {
  /**
   * Name
   */
  name: string;

  /**
   * Name
   */
  description: string;
}
