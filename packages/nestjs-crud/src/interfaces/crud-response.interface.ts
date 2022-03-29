import { IdentityReferenceInterface } from '@concepta/nestjs-common';
export interface CrudResponseInterface<
  T extends IdentityReferenceInterface = IdentityReferenceInterface,
> {
  id: T['id'];
}
