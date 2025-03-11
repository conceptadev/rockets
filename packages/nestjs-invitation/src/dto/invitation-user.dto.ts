import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdDto } from '@concepta/nestjs-common';
import { InvitationUserInterface } from '@concepta/nestjs-common';

@Exclude()
export class InvitationUserDto
  extends ReferenceIdDto
  implements InvitationUserInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email address',
  })
  @IsEmail()
  email = '';
}
