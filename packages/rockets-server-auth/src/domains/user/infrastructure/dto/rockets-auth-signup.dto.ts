import { UserPasswordDto } from '@concepta/nestjs-user';
import { IntersectionType, PickType } from '@nestjs/swagger';

import { RocketsAuthUserDto } from './rockets-auth-user.dto';
import { RocketsAuthUserCreatableInterface } from '../../interfaces/rockets-auth-user-creatable.interface';

/**
  Public signup body. Intentionally omits admin-only fields such as
  `active` — account activation is server-controlled in
  {@link SignupUserHandler} so clients cannot mass-assign it.
 */
export class RocketsAuthSignupDto
  extends IntersectionType(
    PickType(RocketsAuthUserDto, [
      'email',
      'username',
      'userMetadata',
    ] as const),
    UserPasswordDto,
  )
  implements Omit<RocketsAuthUserCreatableInterface, 'active'> {}
