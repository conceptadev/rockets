import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class InvitationDto {
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description: 'Invitation email',
  })
  @IsEmail()
  email = '';
}
