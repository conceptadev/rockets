import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { UserCreatableEncryptedInterface } from '../interfaces/user-creatable-encrypted.interface';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateEncryptedDto
  extends PickType(UserCredentialsDto, ['username', 'password', 'salt'])
  implements UserCreatableEncryptedInterface {}
