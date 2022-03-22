import { IdentityInterface } from '@concepta/nestjs-common';
export interface CrudResponseInterface<
  T extends IdentityInterface = IdentityInterface,
> {
  id: T['id'];
}
