import { IsString } from 'class-validator';
import { AuthJwtResponseInterface } from '../interfaces/auth-jwt-response.interface';

export class AuthJwtResponseDto implements AuthJwtResponseInterface {
  @IsString()
  userId: string;

  @IsString()
  username: string;
}
