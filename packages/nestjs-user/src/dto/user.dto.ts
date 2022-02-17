import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { UserInterface } from '../interfaces/user.interface';

/**
 * User DTO
 */
@Exclude()
export class UserDto implements UserInterface {
  /**
   * Unique id
   */
  @Expose()
  @IsNumber()
  id: string;

  /**
   * Username
   */
  @Expose()
  @IsString()
  username: string;

  /**
   * Password
   */
  password: string;

  /**
   * Salt
   */
  salt: string;
}
