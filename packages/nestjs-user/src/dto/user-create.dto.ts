import { PickType } from '@nestjs/mapped-types';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserDto } from './user.dto';

/**
 * User Create DTO
 */
export class UserCreateDto
  extends PickType(UserDto, ['username', 'password'])
  implements UserCreatableInterface {}
