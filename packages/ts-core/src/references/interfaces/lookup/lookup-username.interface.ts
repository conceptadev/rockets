import { ReferenceUsername } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface LookupUsernameInterface<
  T = ReferenceUsername,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  byUsername: (username: T, options?: O) => Promise<U | null>;
}
