import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OrgUpdatableInterface } from '../interfaces/org-updatable.interface';
import { OrgDto } from './org.dto';

/**
 * Org Update DTO
 */
@Exclude()
export class OrgUpdateDto
  extends PickType(OrgDto, ['name', 'active', 'owner'] as const)
  implements OrgUpdatableInterface {}
