import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserProfileUpdateDto } from '../../dto/profile/user-profile-update.dto';
import { UserProfileDtoFixture } from './user-profile.dto.fixture';

export class UserProfileUpdateDtoFixture extends IntersectionType(
  UserProfileUpdateDto,
  PickType(UserProfileDtoFixture, ['firstName'] as const),
) {}
