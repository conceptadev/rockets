import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { UserUpdatableInterface } from '@concepta/nestjs-common';
import { UserDto } from './user.dto';
import { UserPasswordDto } from './user-password.dto';
import { UserPasswordUpdateDto } from './user-password-update.dto';
import { UserRolesDto } from './user-roles.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PartialType(PickType(UserDto, ['email', 'active'] as const)),
    PartialType(UserPasswordDto),
    PartialType(UserPasswordUpdateDto),
    PartialType(UserRolesDto),
  )
  implements UserUpdatableInterface {}
