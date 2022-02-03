import { IsString } from 'class-validator';
import { AuthJwtPayloadInterface } from '../interfaces/auth-jwt-payload.interface';

export class AuthJwtPayloadDto implements AuthJwtPayloadInterface {
  @IsString()
  sub: string;

  @IsString()
  username: string;
}
