import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserDto } from './user.dto';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PickType(UserDto, ['email']),
    PickType(UserCredentialsDto, ['password']),
  )
  implements UserUpdatableInterface {}
