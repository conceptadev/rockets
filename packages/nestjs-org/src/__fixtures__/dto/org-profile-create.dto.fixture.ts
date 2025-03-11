import { IntersectionType, PickType } from '@nestjs/swagger';
import { OrgProfileCreateDto } from '../../dto/profile/org-profile-create.dto';
import { OrgProfileDtoFixture } from './org-profile.dto.fixture';

export class OrgProfileCreateDtoFixture extends IntersectionType(
  OrgProfileCreateDto,
  PickType(OrgProfileDtoFixture, ['name'] as const),
) {}
