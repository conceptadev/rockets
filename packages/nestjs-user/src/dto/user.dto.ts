import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';
import { UserInterface } from '@concepta/ts-common';

/**
 * User DTO
 */
@Exclude()
export class UserDto implements UserInterface {
  /**
   * Unique id
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: string = '';

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
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  @ValidateNested()
  audit!: AuditInterface;
}
