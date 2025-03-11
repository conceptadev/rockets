import { IsEmail } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { InvitationCreateInviteInterface } from '../interfaces/invitation-create-invite.interface';
import { InvitationCreateDto } from './invitation-create.dto';

@Exclude()
export class InvitationCreateInviteDto
  extends PickType(InvitationCreateDto, ['category', 'constraints'] as const)
  implements InvitationCreateInviteInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email that the invitation will be sent to',
  })
  @IsEmail()
  email = '';
}
