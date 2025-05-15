import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserInterface,
  UserProfileInterface,
  CommonEntityDto,
} from '@concepta/nestjs-common';
import { UserDto } from '../user.dto';

/**
 * User Profile DTO
 */
@Exclude()
export class UserProfileDto
  extends CommonEntityDto
  implements UserProfileInterface
{
  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'The user id of this profile',
  })
  @IsString()
  userId!: string;

  /**
   * Owner
   */
  @Expose()
  @ApiPropertyOptional({
    type: UserDto,
    description: 'The user of this profile',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserInterface;
}
