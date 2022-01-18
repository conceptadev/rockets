import { IsString } from 'class-validator';
import { AuthLocalLoginInterface } from '../interfaces/auth-local-login.interface';

export class AuthLocalLoginDto implements AuthLocalLoginInterface {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
