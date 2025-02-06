import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonEntityDto } from '@concepta/nestjs-common';
import { UserInterface } from '@concepta/nestjs-common';

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

  /**
   * Login Attempts
   */
  @Expose()
  @IsNumber()
  @ApiPropertyOptional({
    type: 'number',
    description: 'Number of login attempts',
  })
  @IsOptional()
  loginAttempts?: number;

  /**
   * Last Login
   */
  @Expose()
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    description: 'Last login timestamp',
  })
  @IsDate()
  @IsOptional()
  lastLogin?: Date | null;
}
