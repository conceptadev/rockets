import { PickType } from '@nestjs/mapped-types';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserDto } from './user.dto';

/**
 * User Update DTO
 */
export class UserUpdateDto
  extends PickType(UserDto, ['password'])
  implements UserUpdatableInterface {}
