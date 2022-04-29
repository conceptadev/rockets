import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserDto } from './user.dto';
import { UserNewPasswordDto } from './user-new-password.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PickType(UserDto, ['email']),
    PickType(UserNewPasswordDto, ['newPassword'] as const),
  )
  implements UserUpdatableInterface {}
