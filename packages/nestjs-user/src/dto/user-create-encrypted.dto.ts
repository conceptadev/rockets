import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserCreatableEncryptedInterface } from '../interfaces/user-creatable-encrypted.interface';
import { UserDto } from './user.dto';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Create DTO
 */
@Exclude()
export class UserCreateEncryptedDto
  extends IntersectionType(
    PickType(UserDto, ['email']),
    PickType(UserCredentialsDto, ['username', 'password', 'salt']),
  )
  implements UserCreatableEncryptedInterface {}
