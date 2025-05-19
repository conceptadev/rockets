import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { OrgUpdatableInterface } from '@concepta/nestjs-common';
import { OrgDto } from './org.dto';

/**
 * Org Update DTO
 */
@Exclude()
export class OrgUpdateDto
  extends IntersectionType(
    PickType(OrgDto, ['id'] as const),
    PartialType(PickType(OrgDto, ['name', 'active', 'ownerId'] as const)),
  )
  implements OrgUpdatableInterface {}
