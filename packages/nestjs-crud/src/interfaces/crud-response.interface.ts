import { IdentityInterface } from '@rockts-org/nestjs-common';
export interface CrudResponseInterface<
  T extends IdentityInterface = IdentityInterface,
> {
  id: T['id'];
}
