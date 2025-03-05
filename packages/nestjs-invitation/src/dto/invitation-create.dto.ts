import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import { InvitationDto } from './invitation.dto';

@Exclude()
export class InvitationCreateDto
  extends PickType(InvitationDto, [
    'email',
    'category',
    'user',
    'code',
    'constraints',
  ] as const)
  implements InvitationCreatableInterface {}
