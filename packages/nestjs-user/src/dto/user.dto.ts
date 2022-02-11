import { IsNumber, IsString } from 'class-validator';
import { UserInterface } from '../interfaces/user.interface';

/**
 * User DTO
 */
export class UserDto implements UserInterface {
  /**
   * Unique id
   */
  @IsNumber()
  id: string;

  /**
   * Username
   */
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
