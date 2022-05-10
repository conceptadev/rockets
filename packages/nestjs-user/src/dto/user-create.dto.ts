import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserDto } from './user.dto';
import { UserPasswordDto } from './user-password.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateDto
  extends IntersectionType(
    PickType(UserDto, ['username', 'email'] as const),
    UserPasswordDto,
  )
  implements UserCreatableInterface {}
