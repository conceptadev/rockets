import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OrgCreatableInterface } from '../interfaces/org-creatable.interface';
import { OrgDto } from './org.dto';

/**
 * User Create DTO
 */
@Exclude()
export class OrgCreateDto
  extends PickType(OrgDto, ['name', 'ownerUserId'] as const)
  implements OrgCreatableInterface {}
