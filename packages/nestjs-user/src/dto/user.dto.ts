import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { CrudResponseDto } from '@rockts-org/nestjs-crud';
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
   * Username
   */
  @Expose()
  @IsString()
  username: string;
}
