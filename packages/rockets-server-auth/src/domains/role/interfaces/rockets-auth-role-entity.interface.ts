import { RoleEntityInterface } from '@concepta/nestjs-role';
import { RocketsAuthRoleInterface } from './rockets-auth-role.interface';

export interface RocketsAuthRoleEntityInterface
  extends RoleEntityInterface,
    RocketsAuthRoleInterface {}
