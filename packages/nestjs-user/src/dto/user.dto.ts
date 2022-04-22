import { IsEmail, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: ReferenceId;

  /**
   * Email
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email',
  })
  @IsEmail()
  email: ReferenceEmail;

  /**
   * Username
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  username: ReferenceUsername;
}
