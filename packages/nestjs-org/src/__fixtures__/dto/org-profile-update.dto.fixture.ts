import { IntersectionType, PickType } from '@nestjs/swagger';
import { OrgProfileUpdateDto } from '../../dto/profile/org-profile-update.dto';
import { OrgProfileDtoFixture } from './org-profile.dto.fixture';

export class OrgProfileUpdateDtoFixture extends IntersectionType(
  OrgProfileUpdateDto,
  PickType(OrgProfileDtoFixture, ['name'] as const),
) {}
