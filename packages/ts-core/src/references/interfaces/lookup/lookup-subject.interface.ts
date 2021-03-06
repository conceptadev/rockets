import { ReferenceSubject } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface LookupSubjectInterface<
  T = ReferenceSubject,
  U = ReferenceIdInterface,
> {
  bySubject: (subject: T) => Promise<U | null>;
}
