import { ReferenceIdInterface } from './reference-id.interface';

export interface ReferenceUserInterface<T = ReferenceIdInterface> {
  user: T;
}
