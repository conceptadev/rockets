import { PickType } from '@nestjs/swagger';
import { RocketsAuthRoleCreatableInterface } from '../../interfaces/rockets-auth-role-creatable.interface';
import { RocketsAuthRoleDto } from './rockets-auth-role.dto';

export class RocketsAuthRoleCreateDto
  extends PickType(RocketsAuthRoleDto, ['name', 'description'] as const)
  implements RocketsAuthRoleCreatableInterface {}
