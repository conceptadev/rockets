import { UserIdentityInterface } from './user-identity.interface';

export interface UserLookupServiceInterface<
  T extends UserIdentityInterface = UserIdentityInterface,
> {
  getUser(id: T['id']): Promise<T>;
}
