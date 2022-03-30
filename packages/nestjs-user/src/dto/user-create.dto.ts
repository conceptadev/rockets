import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserDto } from './user.dto';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateDto
  extends IntersectionType(
    PickType(UserDto, ['email']),
    PickType(UserCredentialsDto, ['username', 'password']),
  )
  implements UserCreatableInterface {}
