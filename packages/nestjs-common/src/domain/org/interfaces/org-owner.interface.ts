import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceId } from '../../../reference/interfaces/reference.types';

export interface OrgOwnerInterface {
  /**
   * Org owner id
   */
  ownerId: ReferenceId;

  /**
   * Org Owner
   */
  owner?: ReferenceIdInterface;
}
