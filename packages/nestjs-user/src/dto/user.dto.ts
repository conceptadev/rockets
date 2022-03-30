import { IsEmail, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { UserInterface } from '../interfaces/user.interface';

/**
 * User DTO
 */
@Exclude()
export class UserDto
  extends CrudResponseDto<UserInterface>
  implements UserInterface
{
  /**
   * Unique id
   */
  @Expose()
  @IsString()
  id: string;

  /**
   * Email
   */
  @Expose()
  @IsEmail()
  email: string;

  /**
   * Username
   */
  @Expose()
  @IsString()
  username: string;
}
