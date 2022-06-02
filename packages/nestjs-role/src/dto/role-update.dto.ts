import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { RoleUpdatableInterface } from '../interfaces/role-updatable.interface';
import { RoleDto } from './role.dto';

/**
 * Role Update DTO
 */
@Exclude()
export class RoleUpdateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements RoleUpdatableInterface {}
