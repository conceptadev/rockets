import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { InvitationCreateOneInterface } from '../interfaces/invitation-create-one.interface';
import { InvitationCreateDto } from './invitation-create.dto';

@Exclude()
export class InvitationCreateOneDto
  extends PickType(InvitationCreateDto, [
    'email',
    'category',
    'constraints',
  ] as const)
  implements InvitationCreateOneInterface {}
