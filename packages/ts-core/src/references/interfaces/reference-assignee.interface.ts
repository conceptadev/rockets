import { ReferenceIdInterface } from './reference-id.interface';

/**
 * Identifiable by assignee.
 */
export interface ReferenceAssigneeInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  assignee: T;
}
