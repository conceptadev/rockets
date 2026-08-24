import { PartialType, PickType } from '@nestjs/swagger';
import { RocketsAuthRoleUpdatableInterface } from '../../interfaces/rockets-auth-role-updatable.interface';
import { RocketsAuthRoleDto } from './rockets-auth-role.dto';

export class RocketsAuthRoleUpdateDto
  extends PartialType(
    PickType(RocketsAuthRoleDto, ['name', 'description'] as const),
  )
  implements RocketsAuthRoleUpdatableInterface {}
