import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordPlainInterface } from '@concepta/nestjs-common';

/**
 * User plain password DTO
 */
@Exclude()
export class UserPasswordDto implements PasswordPlainInterface {
  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Plain text password to set',
  })
  @IsString()
  password!: string;
}
