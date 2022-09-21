import { ReferenceSubject } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface LookupSubjectInterface<
  T = ReferenceSubject,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  bySubject: (subject: T, options?: O) => Promise<U | null>;
}
