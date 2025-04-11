import { ReferenceIdInterface } from '../../reference/interfaces/reference-id.interface';
import { ReferenceUsername } from '../../reference/interfaces/reference.types';

export interface ByUsernameInterface<
  T = ReferenceUsername,
  U = ReferenceIdInterface,
> {
  byUsername: (username: T) => Promise<U | null>;
}
