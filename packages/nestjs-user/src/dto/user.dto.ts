import { IsEmail, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
} from '@concepta/nestjs-common';
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
  id: ReferenceId;

  /**
   * Email
   */
  @Expose()
  @IsEmail()
  email: ReferenceEmail;

  /**
   * Username
   */
  @Expose()
  @IsString()
  username: ReferenceUsername;
}
