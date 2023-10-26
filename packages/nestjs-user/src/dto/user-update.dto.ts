import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { UserUpdatableInterface } from '@concepta/ts-common';
import { UserDto } from './user.dto';
import { UserPasswordDto } from './user-password.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PartialType(PickType(UserDto, ['email', 'active'] as const)),
    PartialType(UserPasswordDto),
  )
  implements UserUpdatableInterface {}
