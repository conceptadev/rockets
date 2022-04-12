import { ReferenceIdInterface } from '../reference-id.interface';

export interface ReplaceOneInterface<
  T extends ReferenceIdInterface,
  U = ReferenceIdInterface,
> {
  replace: (object: T) => Promise<U>;
}
