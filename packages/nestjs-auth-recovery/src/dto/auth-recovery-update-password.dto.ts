import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthRecoveryUpdatePasswordDto {
  @ApiProperty({
    title: 'account reset passcode',
    type: 'string',
    description: 'Passcode used to reset account password',
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
