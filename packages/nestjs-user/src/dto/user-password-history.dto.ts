import { IsString, IsUUID } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import {
  CommonEntityDto,
  UserPasswordHistoryInterface,
} from '@concepta/nestjs-common';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User Password History DTO
 */
@Exclude()
export class UserPasswordHistoryDto
  extends CommonEntityDto
  implements UserPasswordHistoryInterface
{
  /**
   * Password Hash
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Password Hash',
  })
  @IsString()
  passwordHash!: string;

  /**
   * Password Salt
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Password Salt',
  })
  @IsString()
  passwordSalt!: string;

  /**
   * User ID
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'User ID',
  })
  @IsUUID()
  userId!: string;
}
