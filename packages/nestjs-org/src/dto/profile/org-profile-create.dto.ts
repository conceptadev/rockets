import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OrgProfileCreatableInterface } from '@concepta/nestjs-common';
import { OrgProfileDto } from './org-profile.dto';

/**
 * Org Profile Create DTO
 */
@Exclude()
export class OrgProfileCreateDto
  extends PickType(OrgProfileDto, ['orgId'] as const)
  implements OrgProfileCreatableInterface {}
