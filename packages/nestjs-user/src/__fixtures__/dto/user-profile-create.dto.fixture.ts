import { IntersectionType, PickType } from '@nestjs/swagger';
import { UserProfileCreateDto } from '../../dto/profile/user-profile-create.dto';
import { UserProfileDtoFixture } from './user-profile.dto.fixture';

export class UserProfileCreateDtoFixture extends IntersectionType(
  UserProfileCreateDto,
  PickType(UserProfileDtoFixture, ['firstName'] as const),
) {}
