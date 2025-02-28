import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import { InvitationDto } from './invitation.dto';

@Exclude()
export class InvitationCreateDto
  extends IntersectionType(
    PickType(InvitationDto, ['email', 'category'] as const),
    PartialType(PickType(InvitationDto, ['constraints'] as const)),
  )
  implements InvitationCreatableInterface {}
