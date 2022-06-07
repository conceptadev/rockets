import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PasswordPlainInterface } from '@concepta/nestjs-password';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User plain password DTO
 */
@Exclude()
export class UserPasswordDto implements PasswordPlainInterface {
  @Expose({ toClassOnly: true })
  @ApiPropertyOptional({
    type: 'string',
    description: 'Plain text password to set',
  })
  @IsOptional()
  @IsString()
  password!: string;
}
