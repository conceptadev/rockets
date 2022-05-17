import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface OrgInterface
  extends ReferenceIdInterface,
    Partial<ReferenceAuditInterface> {
  /**
   * Name
   */
  name: string;

  /**
   * Flag to determine if the org is active or not
   */
  active: boolean;

  /**
   * ownerUserId
   *
   * @todo maybe change this later to be required
   */
  ownerUserId?: string | null;
}
