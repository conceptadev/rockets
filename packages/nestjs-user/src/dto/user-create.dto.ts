import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { UserCreatableInterface } from '@concepta/nestjs-common';
import { UserDto } from './user.dto';
import { UserPasswordDto } from './user-password.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateDto
  extends IntersectionType(
    PickType(UserDto, ['username', 'email'] as const),
    PartialType(PickType(UserDto, ['active'] as const)),
    PartialType(UserPasswordDto),
  )
  implements UserCreatableInterface {}
