import { PartialType, PickType } from '@nestjs/swagger';

import { RocketsAuthUserDto } from './rockets-auth-user.dto';
import { RocketsAuthUserUpdatableInterface } from '../../interfaces/rockets-auth-user-updatable.interface';

/**
 * When subclassing and overriding `userMetadata`, redefine the property
 * with its own decorators — do not use `declare`.
 */
export class RocketsAuthUserUpdateDto
  extends PartialType(
    PickType(RocketsAuthUserDto, [
      'username',
      'email',
      'active',
      'userMetadata',
    ] as const),
  )
  implements RocketsAuthUserUpdatableInterface {}
