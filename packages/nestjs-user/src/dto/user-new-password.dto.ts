import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { PasswordNewInterface } from '@concepta/nestjs-password';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User new password DTO
 */
@Exclude()
export class UserNewPasswordDto implements PasswordNewInterface {
  @Expose({ toClassOnly: true })
  @ApiProperty({ type: 'string', description: 'New password to set' })
  @IsString()
  newPassword: string;
}
