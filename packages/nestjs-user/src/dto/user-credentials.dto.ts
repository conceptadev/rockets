import { PickType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { UserCredentialsInterface } from '../interfaces/user-credentials.interface';
import { UserDto } from './user.dto';

/**
 * User Credentials DTO
 */
@Exclude()
export class UserCredentialsDto
  extends PickType(UserDto, ['id', 'username'])
  implements UserCredentialsInterface
{
  @Expose()
  @IsString()
  password: string;

  @Expose()
  @IsString()
  salt: string;
}
