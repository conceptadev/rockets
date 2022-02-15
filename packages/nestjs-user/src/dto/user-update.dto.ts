import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserCreateDto } from './user-create.dto';

/**
 * User Update DTO
 */
export class UserUpdateDto
  extends UserCreateDto
  implements UserUpdatableInterface {}
