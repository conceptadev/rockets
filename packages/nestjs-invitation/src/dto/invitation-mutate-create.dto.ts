import { IntersectionType, PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { InvitationMutateCreateInterface } from '../interfaces/invitation-mutate-create.interface';
import { InvitationCreateDto } from './invitation-create.dto';
import { InvitationDto } from './invitation.dto';

@Exclude()
export class InvitationMutateCreateDto
  extends IntersectionType(
    InvitationCreateDto,
    PickType(InvitationDto, ['user', 'code'] as const),
  )
  implements InvitationMutateCreateInterface {}
