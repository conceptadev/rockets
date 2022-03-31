import { IsString } from 'class-validator';
import { ReferenceUsername } from '@concepta/nestjs-common';
import { AuthLocalLoginInterface } from '../interfaces/auth-local-login.interface';

export class AuthLocalLoginDto implements AuthLocalLoginInterface {
  @IsString()
  username: ReferenceUsername;

  @IsString()
  password: string;
}
