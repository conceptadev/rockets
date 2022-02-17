import { PickType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { UserCredentialsInterface } from '../interfaces/user-credentials.interface';
import { UserDto } from './user.dto';

/**
 * User Credentials DTO
 */
@Exclude()
export class UserCredentialsDto
  extends PickType(UserDto, ['id', 'username', 'password', 'salt'])
  implements UserCredentialsInterface
{
  @Expose()
  password: string;

  @Expose()
  salt: string;
}
