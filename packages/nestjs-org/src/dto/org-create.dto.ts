import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OrgCreatableInterface } from '../interfaces/org-creatable.interface';
import { OrgDto } from './org.dto';

/**
 * Org Create DTO
 */
@Exclude()
export class OrgCreateDto
  extends PickType(OrgDto, ['name', 'active', 'owner'] as const)
  implements OrgCreatableInterface {}
