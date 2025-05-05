import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CommonEntityDto, UserInterface } from '@concepta/nestjs-common';

/**
 * User DTO
 */
@Exclude()
export class UserDto extends CommonEntityDto implements UserInterface {
  /**
   * Email
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email',
  })
  @IsEmail()
  email: string = '';

  /**
   * Username
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  username: string = '';

  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'Active',
  })
  @IsBoolean()
  active!: boolean;
}
