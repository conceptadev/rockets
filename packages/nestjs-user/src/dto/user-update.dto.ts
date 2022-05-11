import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserDto } from './user.dto';
import { UserPasswordDto } from './user-password.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PickType(UserDto, ['email'] as const),
    UserPasswordDto,
  )
  implements UserUpdatableInterface {}
