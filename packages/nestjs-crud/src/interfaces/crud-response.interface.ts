import { ReferenceIdInterface } from '@concepta/nestjs-common';
export interface CrudResponseInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  id: T['id'];
}
