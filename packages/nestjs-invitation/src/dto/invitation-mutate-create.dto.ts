import { IntersectionType, PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ReferenceConstraintsDto } from './invitation-constraints.dto';
import { InvitationCreateDto } from './invitation-create.dto';
import { InvitationDto } from './invitation.dto';
import { InvitationMutateCreateInterface } from '../interfaces/invitation-mutate-create.interface';

@Exclude()
export class InvitationMutateCreateDto
  extends IntersectionType(
    PickType(InvitationCreateDto, ['email', 'category'] as const),
    PickType(InvitationDto, ['user', 'code'] as const),
    ReferenceConstraintsDto,
  )
  implements InvitationMutateCreateInterface {}
