import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoverLoginDto {
  @ApiProperty({
    title: 'user email',
    description:
      'Recover email login by providing an email that will receive an username',
  })
  @IsEmail()
  email = '';
}
