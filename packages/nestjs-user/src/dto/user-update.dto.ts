import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserCredentialsDto } from './user-credentials.dto';

/**
 * User Update DTO
 */
@Exclude()
export class UserUpdateDto
  extends PickType(UserCredentialsDto, ['password'])
  implements UserUpdatableInterface {}
