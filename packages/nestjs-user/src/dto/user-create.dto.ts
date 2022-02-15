import { UserCredentialsDto } from './user-credentials.dto';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';

/**
 * User Create DTO
 */
export class UserCreateDto
  extends UserCredentialsDto
  implements UserCreatableInterface {}
