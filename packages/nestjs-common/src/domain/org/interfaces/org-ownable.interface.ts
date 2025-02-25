import { ReferenceId } from '../../../reference/interfaces/reference.types';
import { OrgInterface } from './org.interface';

export interface OrgOwnableInterface {
  orgId: ReferenceId;
  org?: OrgInterface;
}
