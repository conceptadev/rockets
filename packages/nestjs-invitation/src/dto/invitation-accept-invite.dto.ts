import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { LiteralObject } from '@concepta/ts-core';

export class InvitationAcceptInviteDto {
  @ApiProperty({
    title: 'passcode activate token',
    type: 'string',
    description: 'Passcode used to activate account',
  })
  @IsString()
  passcode = '';

  @ApiProperty({
    title: 'Payload',
    type: 'object',
    description: 'New password account',
  })
  @IsObject()
  @IsOptional()
  payload?: LiteralObject;
}
