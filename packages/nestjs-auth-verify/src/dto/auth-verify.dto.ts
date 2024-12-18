import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthVerifyDto {
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description:
      'Verify email by providing an email that will receive a confirmation link',
  })
  @IsEmail()
  email = '';
}
