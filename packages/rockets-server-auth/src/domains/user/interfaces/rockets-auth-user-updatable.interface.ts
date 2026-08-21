import { RocketsAuthUserCreatableInterface } from './rockets-auth-user-creatable.interface';

export interface RocketsAuthUserUpdatableInterface
  extends Partial<
    Pick<RocketsAuthUserCreatableInterface, 'active' | 'userMetadata'>
  > {}
