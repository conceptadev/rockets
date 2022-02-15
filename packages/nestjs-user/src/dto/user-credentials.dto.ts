import { PickType } from '@nestjs/mapped-types';
import { UserCredentialsInterface } from '../interfaces/user-credentials.interface';
import { UserDto } from './user.dto';

/**
 * User Credentials DTO
 */
export class UserCredentialsDto
  extends PickType(UserDto, ['id', 'username', 'password', 'salt'])
  implements UserCredentialsInterface {}
