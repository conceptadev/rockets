import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceUsername } from '@concepta/ts-core';
import { AuthLocalLoginInterface } from '../interfaces/auth-local-login.interface';

@Exclude()
export class AuthLocalLoginDto implements AuthLocalLoginInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  username: ReferenceUsername = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Password',
  })
  @IsString()
  password = '';
}
