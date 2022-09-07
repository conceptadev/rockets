import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PasswordPlainInterface } from '@concepta/ts-common';

/**
 * User plain password DTO
 */
@Exclude()
export class UserPasswordDto implements Partial<PasswordPlainInterface> {
  @Expose({ toClassOnly: true })
  @ApiPropertyOptional({
    type: 'string',
    description: 'Plain text password to set',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
