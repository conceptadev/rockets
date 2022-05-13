import { ReferenceIdInterface } from '@concepta/ts-core';

export interface OrgInterface extends ReferenceIdInterface {
  /**
   * Name
   */
  name: string;

  /**
   * createdAt
   */
  createdAt: Date;

  /**
   * updatedAt
   */
  updatedAt: Date;

  /**
   * deletedAt
   */
  deletedAt: Date | null;

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
