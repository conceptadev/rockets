import { IsNumber, IsString } from 'class-validator';
import { UserReadableInterface } from '../interfaces/user-readable.interface';

/**
 * User Read DTO
 */
export class UserReadDto implements UserReadableInterface {
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
}
