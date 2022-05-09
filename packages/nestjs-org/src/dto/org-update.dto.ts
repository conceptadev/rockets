import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { OrgUpdatableInterface } from '../interfaces/org-updatable.interface';
import { OrgDto } from './org.dto';

/**
 * User Update DTO
 */
@Exclude()
export class OrgUpdateDto
  extends PickType(OrgDto, ['id', 'name', 'ownerUserId'] as const)
  implements OrgUpdatableInterface {}
