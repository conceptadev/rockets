import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateDto
  extends PickType(UserCredentialsDto, ['username', 'password'])
  implements UserCreatableInterface {}
