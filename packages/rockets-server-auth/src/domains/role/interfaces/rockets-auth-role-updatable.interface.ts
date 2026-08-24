import { RocketsAuthRoleCreatableInterface } from './rockets-auth-role-creatable.interface';

export interface RocketsAuthRoleUpdatableInterface
  extends Partial<
    Pick<RocketsAuthRoleCreatableInterface, 'name' | 'description'>
  > {}
