import { Exclude, Expose } from 'class-transformer';
import { UserCredentialsInterface } from '../interfaces/user-credentials.interface';

/**
 * User Credentials DTO
 */
@Exclude()
export class UserCredentialsDto implements UserCredentialsInterface {
  @Expose()
  username: string;

  @Expose()
  password: string;

  @Expose()
  salt: string;
}
