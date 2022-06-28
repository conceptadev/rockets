import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationLoginInterface } from '@concepta/ts-common';

@Exclude()
export class AuthLocalLoginDto implements AuthenticationLoginInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  username = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Password',
  })
  @IsString()
  password = '';
}
