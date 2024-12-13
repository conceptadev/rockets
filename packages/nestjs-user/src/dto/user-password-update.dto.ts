import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordPlainCurrentInterface } from '@concepta/nestjs-common';
import { UserPasswordDto } from './user-password.dto';

/**
 * User update password DTO
 */
@Exclude()
export class UserPasswordUpdateDto
  extends UserPasswordDto
  implements PasswordPlainCurrentInterface
{
  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Current password to validate',
  })
  @IsOptional()
  @IsString()
  passwordCurrent!: string;
}
