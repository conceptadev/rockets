import { RoleDto } from '@concepta/nestjs-role';
import { RocketsAuthRoleInterface } from '../../interfaces/rockets-auth-role.interface';

export class RocketsAuthRoleDto
  extends RoleDto
  implements RocketsAuthRoleInterface {}
