import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class InvitationCreateDto {
  @Expose()
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description: 'Email that the invitation will be sent to',
  })
  @IsEmail()
  email = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description:
      'Category of invitation that refers the following table name: user, org...',
  })
  @IsString()
  category = '';
}
