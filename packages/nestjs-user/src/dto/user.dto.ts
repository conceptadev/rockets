import { IsNumber, IsString } from 'class-validator';
import { UserInterface } from '../interfaces/user.interface';

export class UserDto implements UserInterface {
  @IsNumber()
  id: string;
  @IsString()
  username: string;
  password: string;
  salt: string;
}