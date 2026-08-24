import { PartialType, PickType } from '@nestjs/swagger';
import { RocketsAuthUserUpdatableInterface } from '../../../domains/user/interfaces/rockets-auth-user-updatable.interface';
import { RocketsAuthUserFixtureDto } from './rockets-auth-user.dto.fixture';

export class RocketsAuthUserUpdateDtoFixture
  extends PartialType(
    PickType(RocketsAuthUserFixtureDto, ['active', 'userMetadata'] as const),
  )
  implements RocketsAuthUserUpdatableInterface {}
