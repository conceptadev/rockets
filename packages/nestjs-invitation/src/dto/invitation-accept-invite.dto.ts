import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InvitationAcceptInviteDto {
  @ApiProperty({
    title: 'passcode activate token',
    type: 'string',
    description: 'Passcode used to activate account',
  })
  @IsString()
  passcode = '';

  @ApiProperty({
    title: 'account new password',
    type: 'string',
    description: 'New password account',
  })
  @IsString()
  newPassword = '';
}
