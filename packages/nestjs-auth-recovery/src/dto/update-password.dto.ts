import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    title: 'account reset passcode',
    description: 'Passcode used to reset account password',
  })
  @IsString()
  passcode = '';
  @ApiProperty({
    title: 'account new password',
    description: 'New password account',
  })
  @IsString()
  newPassword = '';
}
