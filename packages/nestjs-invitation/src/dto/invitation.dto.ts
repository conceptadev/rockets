import { Exclude, Expose, Type } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { ApiProperty } from '@nestjs/swagger';
import { AuditDto, ReferenceIdDto } from '@concepta/nestjs-common';

import { InvitationInterface } from '../../../ts-common/src/invitation/interfaces/invitation.interface';

@Exclude()
export class InvitationDto implements InvitationInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: ReferenceId = '';

  @Expose()
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit!: AuditInterface;

  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Invitation is active',
  })
  active = true;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'recipient email',
  })
  @IsEmail()
  email = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code claim invitation',
  })
  @IsString()
  code = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description:
      'Category of invitation that refers the following table name: user, org...',
  })
  @IsString()
  category = '';

  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'The owner of the org',
  })
  @Type(() => ReferenceIdDto)
  user: ReferenceIdInterface = { id: '' };
}
