import { ReferenceId, ReferenceIdInterface } from '@concepta/nestjs-common';

export interface OrgInterface extends ReferenceIdInterface {
  /**
   * id
   */
  id: ReferenceId;
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
  /** Flag to determine if the org is active or not **/
  active: boolean;
  /**
   * ownerUserId
   */
  //TODO maybe change this later to be required
  ownerUserId?: string | null;
}
