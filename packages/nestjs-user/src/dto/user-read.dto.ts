import { PickType } from '@nestjs/mapped-types';
import { UserReadableInterface } from '../interfaces/user-readable.interface';
import { UserDto } from './user.dto';

/**
 * User Read DTO
 */
export class UserReadDto
  extends PickType(UserDto, ['id', 'username'])
  implements UserReadableInterface {}
