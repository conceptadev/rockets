import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceSubject } from '../../../reference/interfaces/reference.types';

export interface BySubjectInterface<
  T = ReferenceSubject,
  U = ReferenceIdInterface,
> {
  bySubject: (subject: T) => Promise<U | null>;
}
