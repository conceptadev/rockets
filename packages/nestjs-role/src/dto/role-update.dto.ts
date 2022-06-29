import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { RoleUpdatableInterface } from '@concepta/ts-common';
import { RoleDto } from './role.dto';

/**
 * Role Update DTO
 */
@Exclude()
export class RoleUpdateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements RoleUpdatableInterface {}
