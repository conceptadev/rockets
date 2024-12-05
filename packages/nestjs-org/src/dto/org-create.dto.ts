import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { OrgCreatableInterface } from '@concepta/nestjs-common';
import { OrgDto } from './org.dto';

/**
 * Org Create DTO
 */
@Exclude()
export class OrgCreateDto
  extends IntersectionType(
    PickType(OrgDto, ['name', 'owner'] as const),
    PartialType(PickType(OrgDto, ['active'] as const)),
  )
  implements OrgCreatableInterface {}
