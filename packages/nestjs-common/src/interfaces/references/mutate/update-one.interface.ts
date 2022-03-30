import { ReferenceIdInterface } from '../reference-id.interface';

export interface UpdateOneInterface<
  T extends ReferenceIdInterface,
  U = ReferenceIdInterface,
> {
  update: (object: T) => Promise<U>;
}
