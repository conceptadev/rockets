import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthRecoveryRecoverPasswordDto {
  @ApiProperty({
    title: 'user email',
    description:
      'Recover email password by providing an email that will receive a password reset link',
  })
  @IsEmail()
  email = '';
}
