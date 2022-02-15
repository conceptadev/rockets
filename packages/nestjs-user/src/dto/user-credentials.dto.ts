import { UserCredentialsInterface } from '../interfaces/user-credentials.interface';
import { UserReadDto } from './user-read.dto';
import { Exclude } from 'class-transformer';

/**
 * User Credentials DTO
 */
export class UserCredentialsDto
  extends UserReadDto
  implements UserCredentialsInterface
{
  /**
   * Password
   */
  @Exclude()
  password: string;

  /**
   * Salt
   */
  @Exclude()
  salt: string;
}
