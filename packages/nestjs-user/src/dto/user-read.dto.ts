import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { UserReadableInterface } from '../interfaces/user-readable.interface';
import { UserDto } from './user.dto';

/**
 * User Read DTO
 */
@Exclude()
export class UserReadDto
  extends PickType(UserDto, ['id', 'username'])
  implements UserReadableInterface {}
