import { ReferenceIdInterface } from '@concepta/ts-core';
export interface CrudResponseInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  id: T['id'];
}
